import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { Order } from './schemas/order.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully', type: Order })
  @ApiResponse({ status: 404, description: 'User or product not found' })
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'List of all orders', type: [Order] })
  findAllOrders() {
    return this.ordersService.findAllOrders();
  }

  @Get(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get a specific order by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Order ID (UUID or ObjectId)' })
  @ApiResponse({ status: 200, description: 'Order found', type: Order })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOrderById(@Param('id') id: string) {
    return this.ordersService.findOrderById(id);
  }

  @Patch(':id/status')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', type: String, description: 'Order ID (UUID or ObjectId)' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: 'Order status updated successfully', type: Order })
  @ApiResponse({ status: 404, description: 'Order not found' })
  updateOrderStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete an order' })
  @ApiParam({ name: 'id', type: String, description: 'Order ID (UUID or ObjectId)' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  removeOrder(@Param('id') id: string) {
    return this.ordersService.removeOrder(id);
  }
}
