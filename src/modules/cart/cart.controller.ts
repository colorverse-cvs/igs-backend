import { Controller, Post, Get, Patch, Delete, Param, Body, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { SessionService } from '../sessions/session.service';
import { CreateCartItemDto, UpdateCartItemDto } from './dto';

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly sessionService: SessionService,
  ) { }

  private ensureSessionId(req: Request, res: Response) {
    let sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      sessionId = this.sessionService.generateSessionId();
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }
    return sessionId;
  }

  @Post('add')
  @ApiOperation({ summary: 'Add a new item to the cart' })
  @ApiBody({ type: CreateCartItemDto })
  @ApiResponse({ status: 201, description: 'Item successfully added to the cart', })
  async addItem(@Req() req: Request, @Res() res: Response, @Body() createCartItemDto: CreateCartItemDto) {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const sessionId = userId ? undefined : this.ensureSessionId(req, res);
    const cart = await this.cartService.addItem(userId, sessionId, createCartItemDto);
    return res.json(cart);
  }

  @Patch('update/:itemId')
  @ApiOperation({ summary: 'Update a specific cart item quantity' })
  @ApiParam({ name: 'itemId', type: String, example: '6710df1b8e6f3d47f15a7e22' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: 'Cart item quantity successfully updated', })
  async updateItem(@Req() req: Request, @Res() res: Response, @Param('itemId') itemId: string, @Body() updateCartItemDto: UpdateCartItemDto,) {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const sessionId = userId ? undefined : this.ensureSessionId(req, res); //'d2a182cd-a30e-437a-a85e-4827bf6a2b04'
    const cart = await this.cartService.updateItem(userId, sessionId, itemId, updateCartItemDto);
    return res.json(cart);
  }

  @Delete('remove')
  @ApiOperation({ summary: 'Remove the cart' })
  @ApiResponse({ status: 200, description: 'Cart successfully removed', })
  async clearCart(@Req() req: Request, @Res() res: Response) {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const sessionId = userId ? undefined : this.ensureSessionId(req, res);
    await this.cartService.clearCart(userId, sessionId);
    return res.json({ message: 'Cart cleared' });
  }

  @Delete('remove/:itemId')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiParam({ name: 'itemId', type: String, example: '6710df1b8e6f3d47f15a7e22' })
  @ApiResponse({ status: 200, description: 'Cart item successfully removed', })
  async removeItem(@Req() req: Request, @Res() res: Response, @Param('itemId') itemId: string) {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const sessionId = userId ? undefined : this.ensureSessionId(req, res);
    const cart = await this.cartService.removeItem(userId, sessionId, itemId);
    return res.json(cart);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get the current user cart summary' })
  @ApiResponse({
    status: 200,
    description: 'Returns all items in the user’s cart',
  })
  async getCartSummary(@Req() req: Request, @Res() res: Response) {
    const userId = (req.user as any)?.id || (req.user as any)?._id;
    const sessionId = userId ? undefined : this.ensureSessionId(req, res);
    const cart = await this.cartService.getCartSummary(userId, sessionId);
    return res.json(cart);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Perform checkout and clear the user cart' })
  @ApiBody({ type: CheckoutDto })
  @ApiResponse({ status: 200, description: 'Checkout successful, cart cleared', })
  async checkout(@Req() req: Request, @Res() res: Response, @Body() body: CheckoutDto) {
    const user = (req as any).user;
    const userId = user?._id || user?.id;
    const sessionId = userId ? undefined : this.ensureSessionId(req, res);
    // body = {
    //   name: body.name || "test user",
    //   email: body.email || "abc@gmail.com",
    //   phone: body.phone || "+911234567890",
    //   address: body.address || {
    //     line1: "line 1",
    //     city: "city",
    //     state: "state",
    //     postalCode: "123456", 
    //   },
    //   paymentMethod: body.paymentMethod || 'razorpay',
    // }
    const result = await this.cartService.checkout(userId, sessionId, body);
    return res.json(result);
  }
}
