import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Address } from './schemas/address.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, role, profile, addresses, firstName, lastName, } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role,
      profile,
      addresses
    });

    return user.save();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }

  async findOneByField(filter: Record<string, any>) {
    if (!filter || typeof filter !== 'object') {
      throw new Error("Invalid filter object");
    }

    return this.userModel.findOne(filter);
  }

  async findAll(): Promise<User[] | null> {
    return this.userModel.find().exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {

    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid user ID: ${id}`);
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const {profile, addresses, ...rest } = updateUserDto;

    // if (password) {
    //   user.password = await bcrypt.hash(password, 10);
    // }

    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }

    Object.assign(user, rest);

    // if (addresses && addresses.length > 0) {
    //   const validAddressIds = addresses
    //     .map(addr => {
    //       const idLike = (addr as any)._id ?? (addr as any).id ?? addr;
    //       try {
    //         return new Types.ObjectId(String(idLike));
    //       } catch {
    //         return null;
    //       }
    //     })
    //     .filter(Boolean);

    //   user.addresses = validAddressIds;
    // }

    await user.save();

    const { password: _, ...safeUser } = user.toObject();
    return safeUser as User;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async addAddress(userId: string, dto: Partial<Address>): Promise<Address> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (dto.isDefault) {
      (user.addresses || []).forEach((a: any) => (a.isDefault = false));
    }

    const addr = dto as Address;
    user.addresses.push(addr);
    await user.save();

    return user.addresses[user.addresses.length - 1];
  }

  async updateAddress(userId: string, addressId: string, dto: Partial<Address>): Promise<Address> {
    const user = await this.userModel.findOne({ _id: userId, 'addresses._id': addressId });
    if (!user) throw new NotFoundException('User or address not found');

    if (dto.isDefault) {
      (user.addresses || []).forEach((a: any) => (a.isDefault = false));
    }

    const addrIndex = (user.addresses || []).findIndex((a: any) => a._id?.toString() === addressId);
    if (addrIndex === -1) throw new NotFoundException('Address not found');

    const addr = user.addresses[addrIndex];
    Object.assign(addr, dto);
    // ensure mongoose notices changes to the addresses array
    if (typeof (user as any).markModified === 'function') {
      (user as any).markModified('addresses');
    }
    await user.save();
    return addr as Address;
  }

  async removeAddress(userId: string, addressId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const addrIndex = (user.addresses as any[]).findIndex((addr: any) => addr._id?.toString() === addressId);
    if (addrIndex === -1) throw new NotFoundException('Address not found');
    user.addresses.splice(addrIndex, 1);
    await user.save();
  }

  async getAddresses(userId: string): Promise<Address[]> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');
    return user.addresses || [];
  }

  async getDefaultAddress(userId: string): Promise<Address | null> {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');
    const addrs: Address[] = user.addresses || [];
    return addrs.find(a => a.isDefault) || addrs[0] || null;
  }
}

