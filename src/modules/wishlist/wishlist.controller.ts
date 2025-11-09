import { Controller, Post, Delete, Get, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { Request } from 'express';
import { Wishlist } from './schemas/wishlist.entity';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiResponse({ status: 201, description: 'Product added to wishlist', type: Wishlist })
  @ApiResponse({ status: 404, description: 'User or Product not found' })
  addToWishlist(@Req() req: Request, @Param('productId') productId: string) {
    const userId = (req as any).user.id;
    return this.wishlistService.addToWishlist(userId, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist' })
  @ApiResponse({ status: 404, description: 'Wishlist item not found' })
  removeFromWishlist(@Req() req: Request, @Param('productId') productId: string) {
    const userId = (req as any).user.id;
    return this.wishlistService.removeFromWishlist(userId, productId);
  }

  @Get()
  @ApiOperation({ summary: 'View user wishlist' })
  @ApiResponse({ status: 200, description: 'List of wishlist items', type: [Wishlist] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  viewWishlist(@Req() req: Request) {
    const userId = (req as any).user.id;
    return this.wishlistService.viewWishlist(userId);
  }
}
