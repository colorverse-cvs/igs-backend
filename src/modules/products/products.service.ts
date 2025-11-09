import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.entity';
import { Category, CategoryDocument } from './schemas/category.entity';
import { CreateProductDto, UpdateProductDto, CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async createProduct(createProductDto: CreateProductDto, files?: Express.Multer.File[]): Promise<Product> {
    const { categoryId, ...rest } = createProductDto;
    const category = await this.categoryModel.findById(categoryId);
    if (!category) throw new NotFoundException('Category not found');

    const images = files?.map((file, index) => ({
      url: `/uploads/products/${file.filename}`,
      isPrimary: index === 0,
      position: index,
      meta: {
        originalName: file.originalname,
        mimeType: file.mimetype,
      },
    }));

    const product = new this.productModel({ ...rest, category: category.id, images, });
    const savedProduct = await product.save();

    // optionally link product to category
    category.products.push(savedProduct.id);
    await category.save();

    return savedProduct.populate('category');
  }

  async findAllProducts(): Promise<Product[]> {
    return this.productModel.find().populate('category').exec();
  }

  async findProductById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate('category').exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto, files?: Express.Multer.File[]): Promise<Product> {
    const { categoryId, ...rest } = updateProductDto;
    const product = await this.findProductById(id);
    let images: { url: string; isPrimary: boolean; position: number; meta: { originalName: string; mimeType: string; }; }[] | undefined;
    if (files?.length) {
      images = files.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        isPrimary: index === 0,
        position: index,
        meta: {
          originalName: file.originalname,
          mimeType: file.mimetype,
        },
      }));

      updateProductDto['images'] = images;
    }
    if (categoryId) {
      const category = await this.categoryModel.findById(categoryId);
      if (!category) throw new NotFoundException('Category not found');
      product.category = category.id;
    }

    Object.assign(product, rest);
    await product.save();
    return product.populate('category');
  }

  async removeProduct(id: string): Promise<void> {
    const product = await this.findProductById(id);
    await this.productModel.deleteOne({ id: id });

    // Also remove from category’s products array (optional cleanup)
    await this.categoryModel.updateOne(
      { id: product.category },
      { $pull: { products: id } },
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const regex = new RegExp(query, 'i');
    return this.productModel.find({
      $or: [{ name: regex }, { description: regex }],
    }).exec();
  }

  async filterProducts(categoryId?: string, minPrice?: number, maxPrice?: number, minRating?: number,): Promise<Product[]> {
    const filter: any = {};

    if (categoryId) {
      filter.category = categoryId;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    if (minRating) {
      filter.rating = { $gte: minRating };
    }

    return this.productModel.find(filter).exec();
  }


  // category methods
  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = new this.categoryModel(createCategoryDto);
    return category.save();
  }

  async findAllCategories(): Promise<Category[]> {
    return this.categoryModel.find().populate('products').exec();
  }

  async findCategoryById(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).populate('products').exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findCategoryById(id);
    Object.assign(category, updateCategoryDto);
    return category.save();
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findCategoryById(id);
    await this.categoryModel.deleteOne({ id: id });

    await this.productModel.updateMany(
      { category: id },
      { $unset: { category: '' } },
    );
  }
}
