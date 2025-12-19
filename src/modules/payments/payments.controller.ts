import { Controller, Post, Body, Param, Req, HttpCode, HttpStatus, BadRequestException, UseGuards, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Request } from 'express';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentMethod } from './schemas/payment.entity';
import { RazorpayVerifyDto } from './dto/razorpay-verify.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
    ) { }

    // @Post(':orderId([0-9a-fA-F]{24})')
    // @ApiOperation({ summary: 'Create a payment for an order (stripe / cod / paypal etc.)' })
    // @ApiParam({ name: 'orderId', type: String, description: 'Order ID' })
    // @ApiBody({ type: CreatePaymentDto })
    // @ApiResponse({ status: 201, description: 'Payment created' })
    // async createPayment(
    //     @Param('orderId') orderId: string,
    //     @Body() createPaymentDto: CreatePaymentDto,
    // ) {
    //     const method = createPaymentDto?.paymentMethod;
    //     return this.paymentsService.createPayment(orderId, method);
    // }

    @UseGuards(JwtAuthGuard)
    @Roles(Role.Admin)
    @ApiBearerAuth()
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

    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @ApiBearerAuth()
    // @Roles(Role.Admin)
    @Get('/')
    @ApiOperation({ summary: 'Get all transactions (Admin)' })
    async getTransactions(@Query('page') page = 1, @Query('limit') limit = 20,) {
        return this.paymentsService.getTransactions(Number(page), Number(limit));
    }
    // @UseGuards(JwtAuthGuard)
    // @ApiBearerAuth()
    @Post('webhook/:method')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Generic payment webhook endpoint' })
    @ApiParam({ name: 'method', type: String, description: 'Payment method (razorpay|stripe|paypal|cod)' })
    async handleWebhook(@Req() request: Request, @Param('method') method: string,): Promise<void> {

        const paymentMethod = this.normalizePaymentMethod(method);

        await this.paymentsService.handleWebhook(paymentMethod, {
            rawBody: (request as any).rawBody, // Required for signature checks
            body: request.body,
            headers: request.headers,
        });
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify Razorpay order after checkout', description: 'This endpoint verifies the payment using razorpay_signature generated on checkout page.', })
    @ApiBody({ type: RazorpayVerifyDto })
    @ApiResponse({ status: 200, description: 'Successfully verified Razorpay payment', })
    @ApiResponse({ status: 400, description: 'Signature mismatch or invalid razorpay order', })
    async verifyRazorpayPayment(@Body() body: RazorpayVerifyDto, @Req() req: Request) {
        const user = (req as any).user;
        const userId = user?._id;
        return this.paymentsService.verifyPayment(body, userId);
    }

    private normalizePaymentMethod(method: string): PaymentMethod {
        const m = method.toLowerCase();
        switch (m) {
            case 'razorpay':
                return PaymentMethod.RAZORPAY;
            case 'stripe':
                return PaymentMethod.STRIPE;
            case 'cod':
            case 'cash_on_delivery':
            case 'cash-on-delivery':
                return PaymentMethod.CASH_ON_DELIVERY;
            default:
                throw new BadRequestException(`Unsupported payment method: ${method}`);
        }
    }


}
