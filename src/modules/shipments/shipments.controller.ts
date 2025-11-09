import { Controller, Post, Param, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';

@ApiTags('Shipments')
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipments: ShipmentsService) {}

  @Post(':orderId')
  @ApiOperation({ summary: 'Create shipment for an order (carrier optional)' })
  async create(@Param('orderId') orderId: string, @Body() dto: CreateShipmentDto) {
    const carrier = dto?.carrier || 'bluedart';
    return this.shipments.createShipment(orderId, carrier);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipment tracking & refresh from carrier' })
  async get(@Param('id') id: string) {
    // refresh tracking from carrier then return latest
    return this.shipments.refreshTracking(id);
  }

  @Post('webhook/:carrier')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Carrier webhook endpoint (e.g. bluedart)' })
  async webhook(@Param('carrier') carrier: string, @Body() payload: any) {
    await this.shipments.handleCarrierWebhook(carrier.toLowerCase(), payload);
    return { ok: true };
  }
}