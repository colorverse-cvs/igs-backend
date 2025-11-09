import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, CreateCategoryDto, UpdateCategoryDto } from './dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Product } from './schemas/product.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of all products.' })
  findAllProducts() {
    return this.productsService.findAllProducts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the product', example: 'b6a8e7a0-5e1d-4c8e-a512-34f3cbd6e0a1' })
  @ApiResponse({ status: 200, description: 'Product found.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  findProductById(@Param('id') id: string) {
    return this.productsService.findProductById(id);
  }


  @Get('search')
  @ApiOperation({ summary: 'Search products by name or description' })
  @ApiQuery({ name: 'query', type: String, description: 'Search keyword', required: true })
  @ApiResponse({ status: 200, description: 'List of matching products', type: [Product] })
  async searchProducts(@Query('query') query: string) {
    return this.productsService.searchProducts(query);
  }

  @Get('filter')
  @ApiOperation({ summary: 'Filter products based on category, price, and rating' })
  @ApiQuery({ name: 'categoryId', type: String, required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'minPrice', type: Number, required: false, description: 'Minimum price' })
  @ApiQuery({ name: 'maxPrice', type: Number, required: false, description: 'Maximum price' })
  @ApiQuery({ name: 'minRating', type: Number, required: false, description: 'Minimum rating' })
  @ApiResponse({ status: 200, description: 'Filtered product list', type: [Product] })
  async filterProducts(
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minRating') minRating?: number,
  ) {
    return this.productsService.filterProducts(categoryId, minPrice, maxPrice, minRating);
  }

  // 🔸 Category Endpoints

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'List of all categories.' })
  findAllCategories() {
    return this.productsService.findAllCategories();
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the category', example: 'd2e12e3a-18b5-4b9c-b0b3-47ccbd22961f' })
  @ApiResponse({ status: 200, description: 'Category found.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  findCategoryById(@Param('id') id: string) {
    return this.productsService.findCategoryById(id);
  }

  // ADMIN API 

  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  @ApiBody({ type: CreateProductDto })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }


  @Patch(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update a product (Admin only)' })
  @ApiParam({ name: 'id', description: 'UUID of the product' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  @ApiParam({ name: 'id', description: 'UUID of the product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  removeProduct(@Param('id') id: string) {
    return this.productsService.removeProduct(id);
  }

  @Roles(Role.Admin)
  @Post('categories')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.productsService.createCategory(createCategoryDto);
  }

  @Roles(Role.Admin)
  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update category details' })
  @ApiParam({ name: 'id', description: 'UUID of the category' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.productsService.updateCategory(id, updateCategoryDto);
  }

  @Roles(Role.Admin)
  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'UUID of the category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  removeCategory(@Param('id') id: string) {
    return this.productsService.removeCategory(id);
  }
}
