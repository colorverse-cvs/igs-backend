import { Controller, Post, Get, Patch, Delete, Param, Body, Req, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartItemDto, UpdateCartItemDto } from './dto';
import { Request } from 'express';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Post('add')
  @ApiOperation({ summary: 'Add a new item to the cart' })
  @ApiBody({ type: CreateCartItemDto })
  @ApiResponse({
    status: 201,
    description: 'Item successfully added to the cart',
  })
  addItem(@Req() req: Request, @Body() createCartItemDto: CreateCartItemDto) {
    const userId = (req.user as any).id || (req.user as any)._id;

    return this.cartService.addItem(userId, createCartItemDto);
  }

  @Patch('update/:itemId')
  @ApiOperation({ summary: 'Update a specific cart item quantity' })
  @ApiParam({ name: 'itemId', type: String, example: '6710df1b8e6f3d47f15a7e22' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({
    status: 200,
    description: 'Cart item quantity successfully updated',
  })
  updateItem(
    @Req() req: Request,
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const userId = (req.user as any).id || (req.user as any)._id;

    return this.cartService.updateItem(userId, itemId, updateCartItemDto);
  }

  @Delete('remove/:itemId')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiParam({ name: 'itemId', type: String, example: '6710df1b8e6f3d47f15a7e22' })
  @ApiResponse({
    status: 200,
    description: 'Cart item successfully removed',
  })
  removeItem(@Req() req: Request, @Param('itemId') itemId: string) {
    const userId = (req.user as any).id || (req.user as any)._id;

    return this.cartService.removeItem(userId, itemId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get the current user cart summary' })
  @ApiResponse({
    status: 200,
    description: 'Returns all items in the user’s cart',
  })
  getCartSummary(@Req() req: Request) {
    const userId = (req.user as any).id || (req.user as any)._id;

    return this.cartService.getCartSummary(userId);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Perform checkout and clear the user cart' })
  @ApiResponse({
    status: 200,
    description: 'Checkout successful, cart cleared',
  })
  async checkout(@Req() req: Request) {
    const userId = (req.user as any).id || (req.user as any)._id;

    const cart = await this.cartService.getCartSummary(userId);
    await this.cartService.clearCart(userId);
    return { message: 'Checkout successful' };
  }
}
