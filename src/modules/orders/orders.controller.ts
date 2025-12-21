import { Controller, Get, Post, Body, Param, Patch, Delete, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { Order } from './schemas/order.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
// import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  // @Post()
  // @ApiOperation({ summary: 'Create a new order' })
  // @ApiBody({ type: CreateOrderDto })
  // @ApiResponse({ status: 201, description: 'Order created successfully', type: Order })
  // @ApiResponse({ status: 404, description: 'User or product not found' })
  // createOrder(@Body() createOrderDto: CreateOrderDto) {
  //   return this.ordersService.createOrder(createOrderDto);
  // }

  @UseGuards(JwtAuthGuard)
  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all orders', type: [Order] })
  findAllOrders() {
    return this.ordersService.findAllOrders();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id([0-9a-fA-F]{24})')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get a specific order by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Order ID (UUID or ObjectId)' })
  @ApiResponse({ status: 200, description: 'Order found', type: Order })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOrderById(@Param('id') id: string) {
    return this.ordersService.findOrderById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', type: String, description: 'Order ID (UUID or ObjectId)' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: 'Order status updated successfully', type: Order })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    const actor = (req as any).user;
    const order = await this.ordersService.updateOrderStatus(id, dto.status, dto.reason, actor);
    return order;
  }

  // @UseGuards(JwtAuthGuard)
  // @Delete(':id')
  // @Roles(Role.Admin)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Delete an order' })
  // @ApiParam({ name: 'id', type: String, description: 'Order ID (UUID or ObjectId)' })
  // @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  // @ApiResponse({ status: 404, description: 'Order not found' })
  // removeOrder(@Param('id') id: string) {
  //   return this.ordersService.removeOrder(id);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders of the logged-in user' })
  @ApiResponse({ status: 200, description: 'List of user orders', type: [Order] })
  async getMyOrders(@Req() req: any) {
    const userId = (req as any).user?._id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.ordersService.findUserOrders(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an order (Customer/Admin)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully', type: Order })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancelOrder(@Req() req: any,  @Param('id') id: string, @Body('reason') reason?: string,) {
    const actor = req.user;
    return this.ordersService.cancelOrder(id, actor, reason);
  }


}
