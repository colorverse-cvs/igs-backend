import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shipment, ShipmentDocument, ShipmentStatus } from './schemas/shipment.entity';
import { BlueDartService } from './blue-dart.service';
import { Order } from '../orders/schemas/order.entity';

@Injectable()
export class ShipmentsService {
  private readonly logger = new Logger(ShipmentsService.name);

  constructor(
    @InjectModel(Shipment.name) private readonly shipmentModel: Model<ShipmentDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<any>,
    private readonly blueDart: BlueDartService,
  ) {}

  async createShipment(orderId: string, carrier = 'bluedart'): Promise<Shipment> {
    const order = await this.orderModel.findById(orderId).lean() as any;
    if (!order) throw new NotFoundException('Order not found');

    if (!order.shippingAddress) throw new BadRequestException('Order missing shipping address');

    // Build carrier-specific payload (map as BlueDart expects)
    const carrierPayload = {
      consignor: {
        name: 'Your Company',
        address: 'Sender address',
      },
      consignee: {
        name: order.shippingAddress.name || `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim(),
        address: order.shippingAddress.addressLine1,
        city: order.shippingAddress.city,
        pincode: order.shippingAddress.postalCode || order.shippingAddress.zip,
        phone: order.shippingAddress.phone,
      },
      pieces: order.items?.length || 1,
      value: order.total,
      orderReference: orderId,
      items: (order.items || []).map((it) => ({ sku: it.product?.sku || '', qty: it.quantity })),
    };

    let createResult;
    if (carrier === 'bluedart') {
      createResult = await this.blueDart.createShipment(carrierPayload);
    } else {
      throw new BadRequestException('Unsupported carrier');
    }

    const shipment = await this.shipmentModel.create({
      order: order._id,
      carrier,
      trackingId: createResult.trackingId,
      status: ShipmentStatus.CREATED,
      estimatedDelivery: createResult.estimatedDelivery ? new Date(createResult.estimatedDelivery) : undefined,
      rawResponse: createResult.raw,
      history: [{ status: ShipmentStatus.CREATED, timestamp: new Date(), raw: createResult.raw }],
    });

    // update order: set shipment id and shipped status (ensure Order schema has these fields)
    await this.orderModel.findByIdAndUpdate(orderId, { status: 'shipped', shipment: shipment._id });

    return shipment;
  }

  async refreshTracking(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentModel.findById(shipmentId);
    if (!shipment) throw new NotFoundException('Shipment not found');

    let providerData: any;
    if (shipment.carrier === 'bluedart') {
      providerData = await this.blueDart.track(shipment.trackingId);
    } else {
      throw new BadRequestException('Unsupported carrier');
    }

    // Map provider events -> standardized history entries
    const events = (providerData?.events || []).map((e: any) => ({
      status: e.status || e.activity,
      location: e.location,
      timestamp: e.time ? new Date(e.time) : new Date(),
      raw: e,
    }));

    // determine new status simply via last event
    const last = events[events.length - 1];
    const newStatus = last?.status?.toLowerCase().includes('delivered')
      ? ShipmentStatus.DELIVERED
      : ShipmentStatus.IN_TRANSIT;

    shipment.status = newStatus;
    shipment.history = [...(shipment.history || []), ...events];
    shipment.rawResponse = providerData;
    await shipment.save();

    if (newStatus === ShipmentStatus.DELIVERED) {
      await this.orderModel.findByIdAndUpdate(shipment.order, { status: 'delivered' });
    }

    return shipment;
  }

  async findById(id: string): Promise<Shipment> {
    return this.shipmentModel.findById(id).populate('order').lean();
  }

  // helper for carrier webhook processing (simple example)
  async handleCarrierWebhook(carrier: string, payload: any): Promise<void> {
    // Implement validation and mapping per carrier
    const trackingId = payload?.trackingId || payload?.awbNo || payload?.shipmentId;
    if (!trackingId) {
      this.logger.warn('Webhook missing tracking id', payload);
      return;
    }

    const shipment = await this.shipmentModel.findOne({ trackingId });
    if (!shipment) {
      this.logger.warn('Shipment not found for webhook', trackingId);
      return;
    }

    const events = (payload?.events || []).map((e: any) => ({
      status: e.status,
      location: e.location,
      timestamp: e.time ? new Date(e.time) : new Date(),
      raw: e,
    }));

    const last = events[events.length - 1];
    const newStatus = last?.status?.toLowerCase().includes('delivered') ? ShipmentStatus.DELIVERED : ShipmentStatus.IN_TRANSIT;

    shipment.status = newStatus;
    shipment.history = [...(shipment.history || []), ...events];
    shipment.rawResponse = payload;
    await shipment.save();

    if (newStatus === ShipmentStatus.DELIVERED) {
      await this.orderModel.findByIdAndUpdate(shipment.order, { status: 'delivered' });
    }
  }
}