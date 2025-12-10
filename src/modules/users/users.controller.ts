import { Controller, Post, Body, Get, Patch, Delete, UseGuards, Req, Param, } from '@nestjs/common';
import { UsersService } from './users.service';
import { AddressDto, CreateUserDto, UpdateUserDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) { }


  @Patch(':id')
  @ApiOperation({ summary: 'Update user data' })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated' })
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get logged-in user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user profile' })
  async getProfile(@Req() req: Request) {
    const user = req.user as any;
    const id = user._id;
    const userData = await this.usersService.findOneById(id);
    delete userData.password;
    return  this.usersService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const user = req.user as any;
    await this.usersService.update(user._id, updateUserDto);
    return this.usersService.findOneByEmail(user.email);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('profile')
  @ApiOperation({ summary: 'Delete user profile' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteProfile(@Req() req: Request) {
    const user = req.user as any;
    await this.usersService.remove(user._id);
  }

  @Get(':id/addresses')
  @ApiOperation({
    summary: 'Get all addresses for a user',
    description: 'Fetches a list of all addresses associated with a specific user by ID.',
  })
  @ApiParam({ name: 'id', description: 'User ID (Mongo ObjectId)', example: '64f0c2f18b8e1b2f6f6f6f6f' })
  @ApiResponse({ status: 200, description: 'List of user addresses', type: [AddressDto] })
  async listAddresses(@Param('id') id: string) {
    return this.usersService.getAddresses(id);
  }

  @Post(':id/addresses')
  @ApiOperation({
    summary: 'Add a new address for a user',
    description: 'Adds a new address to the user’s address book.',
  })
  @ApiParam({ name: 'id', description: 'User ID (Mongo ObjectId)' })
  @ApiBody({ type: AddressDto })
  @ApiResponse({ status: 201, description: 'Address successfully added', type: AddressDto })
  async addAddress(@Param('id') id: string, @Body() body: AddressDto) {
    return this.usersService.addAddress(id, body);
  }

  @Patch(':id/addresses/:addressId')
  @ApiOperation({
    summary: 'Update an existing address',
    description: 'Updates specific fields of an existing user address.',
  })
  @ApiParam({ name: 'id', description: 'User ID (Mongo ObjectId)' })
  @ApiParam({ name: 'addressId', description: 'Address ID (Mongo ObjectId)' })
  @ApiBody({ type: AddressDto })
  @ApiResponse({ status: 200, description: 'Address successfully updated', type: AddressDto })
  async updateAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Body() body: Partial<AddressDto>,
  ) {
    return this.usersService.updateAddress(id, addressId, body);
  }

  @Delete(':id/addresses/:addressId')
  @ApiOperation({
    summary: 'Remove an address',
    description: 'Deletes a specific address from the user’s address list.',
  })
  @ApiParam({ name: 'id', description: 'User ID (Mongo ObjectId)' })
  @ApiParam({ name: 'addressId', description: 'Address ID (Mongo ObjectId)' })
  @ApiResponse({ status: 200, description: 'Address successfully removed' })
  async removeAddress(@Param('id') id: string, @Param('addressId') addressId: string) {
    return this.usersService.removeAddress(id, addressId);
  }

  @Get(':id/addresses/default')
  @ApiOperation({
    summary: 'Get default address',
    description: 'Fetches the default address for a specific user.',
  })
  @ApiParam({ name: 'id', description: 'User ID (Mongo ObjectId)' })
  @ApiResponse({ status: 200, description: 'Default user address', type: AddressDto })
  async getDefault(@Param('id') id: string) {
    return this.usersService.getDefaultAddress(id);
  }

  // ADMIN


  @Get()
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get a list of all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({ status: 403, description: 'Forbidden — Only admins can access this endpoint' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get user details by ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID', example: '6720a2f4d4ab1c2e88f9d123' })
  @ApiResponse({ status: 200, description: 'User details returned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete a user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'User ID', example: '6720a2f4d4ab1c2e88f9d123' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

}
