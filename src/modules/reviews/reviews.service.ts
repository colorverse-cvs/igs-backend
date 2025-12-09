import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.entity';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  async addReview(userId: string, productId: string, createReviewDto: CreateReviewDto,): Promise<Review> {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');

    const product = await this.productsService.findProductById(productId);
    if (!product) throw new NotFoundException('Product not found');

    const review = new this.reviewModel({
      ...createReviewDto,
      user: new Types.ObjectId(user?._id),
      product: new Types.ObjectId(product._id),
    });

    return review.save();
  }

  async updateReview(userId: string, reviewId: string, updateReviewDto: UpdateReviewDto,): Promise<Review> {
    const review = await this.reviewModel.findOne({
      _id: reviewId,
      user: userId,
    });

    if (!review) throw new NotFoundException('Review not found');

    Object.assign(review, updateReviewDto);
    return review.save();
  }

  async deleteReview(userId: string, reviewId: string): Promise<void> {
    const review = await this.reviewModel.findOneAndDelete({
      _id: reviewId,
      user: userId,
    });

    if (!review) throw new NotFoundException('Review not found');
  }

  async getProductReviews(productId: string): Promise<Review[]> {
    return this.reviewModel
      .find({ product: productId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }
}
