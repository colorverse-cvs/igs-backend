import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { Response } from 'express';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get(':orderId')
  @ApiOperation({
    summary: 'Generate and download invoice for a specific order',
    description: 'Creates a PDF invoice for the given order ID and returns it as a downloadable file.',
  })
  @ApiParam({
    name: 'orderId',
    description: 'The unique ID (ObjectId or UUID) of the order to generate invoice for',
    example: '671fe2b7dc98b458ebf994e3',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice PDF successfully generated and returned',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found or invalid order ID',
  })
  async getInvoice(@Param('orderId') orderId: string, @Res() res: Response) {
    const invoicePath = await this.invoicesService.generateInvoice(orderId);
    return res.sendFile(invoicePath, { root: '.' });
  }
}
