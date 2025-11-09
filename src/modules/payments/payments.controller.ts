import { Controller, Post, Body, Param, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Request } from 'express';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentMethod } from './schemas/payment.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
    ) { }

    @Post(':orderId')
    @ApiOperation({ summary: 'Create a payment for an order (stripe / cod / paypal etc.)' })
    @ApiParam({ name: 'orderId', type: String, description: 'Order ID' })
    @ApiBody({ type: CreatePaymentDto })
    @ApiResponse({ status: 201, description: 'Payment created' })
    async createPayment(
        @Param('orderId') orderId: string,
        @Body() createPaymentDto: CreatePaymentDto,
    ) {
        const method = createPaymentDto?.paymentMethod;
        return this.paymentsService.createPayment(orderId, method);
    }

    @Post('process/:paymentId')
    @ApiOperation({ summary: 'Process / confirm a payment (useful for COD confirmation)' })
    @ApiParam({ name: 'paymentId', type: String, description: 'Payment ID' })
    @ApiBody({ schema: { properties: { paymentMethod: { type: 'string' } } } })
    @ApiResponse({ status: 200, description: 'Payment processed' })
    async processPayment(
        @Param('paymentId') paymentId: string,
        @Body() body: { paymentMethod: PaymentMethod },
    ) {
        return this.paymentsService.processPayment(paymentId, body.paymentMethod);
    }

    @Post('webhook/:method')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Generic payment webhook endpoint' })
    @ApiParam({ name: 'method', type: String, description: 'Payment method (stripe|paypal|cod)' })
    @ApiBody({ description: 'Raw provider payload' })
    @ApiResponse({ status: 200, description: 'Webhook processed' })
    async handleWebhook(@Req() request: Request, @Param('method') method: string): Promise<void> {
        const m = method?.toLowerCase();
        let paymentMethod: PaymentMethod = (m === 'stripe')
            ? PaymentMethod.STRIPE
            : (m === 'cod' || m === 'cash_on_delivery' || m === 'cash-on-delivery')
                ? PaymentMethod.CASH_ON_DELIVERY
                : (m === 'stripe')
                    ? PaymentMethod.STRIPE
                    : (method as any);

        await this.paymentsService.handleWebhook(paymentMethod, {
            body: request.body,
            headers: request.headers,
        });
    }
}
