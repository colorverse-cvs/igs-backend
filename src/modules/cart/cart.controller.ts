import { Controller, Post, Get, Patch, Delete, Param, Body, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { SessionService } from '../sessions/session.service';
import { CreateCartItemDto, UpdateCartItemDto } from './dto';

import { Request, Response } from 'express';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a new item to the cart' })
  @ApiBody({ type: CreateCartItemDto })
  @ApiResponse({ status: 201, description: 'Item successfully added to the cart', })
  @Post('add')
  async addItem(@Req() req: Request, @Res() res: Response, @Body() createCartItemDto: CreateCartItemDto) {
    const userId = (req.user as any)?._id;
    const sessionId = userId ? undefined : this.ensureSessionId(req, res);
    const cart = await this.cartService.addItem(userId, sessionId, createCartItemDto);
    return res.json(cart);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a specific cart item quantity' })
  @ApiParam({ name: 'itemId', type: String, example: '6710df1b8e6f3d47f15a7e22' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: 'Cart item quantity successfully updated', })
  @Patch('update/:itemId')
  async updateItem(@Req() req: Request, @Res() res: Response, @Param('itemId') itemId: string, @Body() updateCartItemDto: UpdateCartItemDto,) {
    const userId = (req.user as any)?._id;
    const sessionId = userId ? undefined : this.ensureSessionId(req, res); //'d2a182cd-a30e-437a-a85e-4827bf6a2b04'
    const cart = await this.cartService.updateItem(userId, sessionId, itemId, updateCartItemDto);
    return res.json(cart);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove the cart' })
  @ApiResponse({ status: 200, description: 'Cart successfully removed', })
  @Delete('remove')
  async clearCart(@Req() req: Request, @Res() res: Response) {
    const userId = (req.user as any)?._id;
    const sessionId = userId ? undefined : this.ensureSessionId(req, res);
    await this.cartService.clearCart({ userId, sessionId });
    return res.json({ message: 'Cart cleared' });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove an item from the cart' })
  @ApiParam({ name: 'itemId', type: String, example: '6710df1b8e6f3d47f15a7e22' })
  @ApiResponse({ status: 200, description: 'Cart item successfully removed', })
  @Delete('remove/:itemId')
  async removeItem(@Req() req: Request, @Res() res: Response, @Param('itemId') itemId: string) {
    const userId = (req.user as any)?._id;
    const sessionId = userId ? undefined : this.ensureSessionId(req, res);
    const cart = await this.cartService.removeItem(userId, sessionId, itemId);
    return res.json(cart);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the current user cart summary' })
  @ApiResponse({
    status: 200,
    description: 'Returns all items in the user’s cart',
  })
  @Get('summary')
  async getCartSummary(@Req() req: Request, @Res() res: Response) {
    const userId = (req.user as any)?._id;
    const sessionId = userId ? undefined : this.ensureSessionId(req, res);
    const cart = await this.cartService.getCartSummary(userId, sessionId);
    return res.json(cart);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Perform checkout and clear the user cart' })
  @ApiBody({ type: CheckoutDto })
  @ApiResponse({ status: 200, description: 'Checkout successful, cart cleared', })
  @Post('checkout')
  async checkout(@Req() req: Request, @Res() res: Response, @Body() body: CheckoutDto) {
    const user = (req as any).user;
    const userId = user?._id;
    const sessionId = userId ? undefined : this.ensureSessionId(req, res);
    const result = await this.cartService.checkout(userId, sessionId, body);
    return res.json(result);
  }
}
