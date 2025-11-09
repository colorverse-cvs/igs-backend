import { Controller, Post, Get, Patch, Delete, Param, Body, Req, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { Request } from 'express';
import { Review } from './schemas/review.entity';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post(':productId')
    @ApiOperation({ summary: 'Add a review for a product' })
    @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
    @ApiBody({ type: CreateReviewDto })
    @ApiResponse({ status: 201, description: 'Review created successfully', type: Review })
    @ApiResponse({ status: 404, description: 'User or product not found' })
    addReview(
        @Req() req: Request,
        @Param('productId') productId: string,
        @Body() createReviewDto: CreateReviewDto,
    ) {
        const userId = (req as any).user.id;
        return this.reviewsService.addReview(userId, productId, createReviewDto);
    }

    @Patch(':reviewId')
    @ApiOperation({ summary: 'Update an existing review' })
    @ApiParam({ name: 'reviewId', type: String, description: 'Review ID' })
    @ApiBody({ type: UpdateReviewDto })
    @ApiResponse({ status: 200, description: 'Review updated successfully', type: Review })
    @ApiResponse({ status: 404, description: 'Review not found' })
    updateReview(
        @Req() req: Request,
        @Param('reviewId') reviewId: string,
        @Body() updateReviewDto: UpdateReviewDto,
    ) {
        const userId = (req as any).user.id;
        return this.reviewsService.updateReview(userId, reviewId, updateReviewDto);
    }

    @Delete(':reviewId')
    @ApiOperation({ summary: 'Delete a review' })
    @ApiParam({ name: 'reviewId', type: String, description: 'Review ID' })
    @ApiResponse({ status: 200, description: 'Review deleted successfully' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    deleteReview(@Req() req: Request, @Param('reviewId') reviewId: string) {
        const userId = (req as any).user.id;
        return this.reviewsService.deleteReview(userId, reviewId);
    }

    @Get('product/:productId')
    @ApiOperation({ summary: 'Get all reviews for a product' })
    @ApiParam({ name: 'productId', type: String, description: 'Product ID' })
    @ApiResponse({
        status: 200,
        description: 'List of reviews for the specified product',
        type: [Review],
    })
    getProductReviews(@Param('productId') productId: string) {
        return this.reviewsService.getProductReviews(productId);
    }
}
