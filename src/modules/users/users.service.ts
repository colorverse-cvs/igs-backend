import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Phone, PhoneDocument, User, UserDocument } from './schemas/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Address, AddressDocument } from './schemas/address.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
    @InjectModel(Phone.name) private phoneModel: Model<PhoneDocument>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, role, profile, addresses, phones, firstName, lastName, } = createUserDto;

    const savedAddresses = await this.addressModel.insertMany(addresses || []);
    const savedPhones = await this.phoneModel.insertMany(phones || []);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role,
      profile,
      phones: savedPhones.map(p => p._id),
      addresses: savedAddresses.map(a => a._id),
    });

    return user.save();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }

  async getProfile(userId: string): Promise<User | null> {
    debugger
    return this.userModel
      .findById(userId)
      .select('-password')
      .populate({ path: 'addresses', model: 'Address' })
      .populate({ path: 'phones', model: 'Phone' })
      .exec();
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

    const { profile, addresses, ...rest } = updateUserDto;

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

    // If new address is default → unset old ones
    if (dto.isDefault) {
      await this.addressModel.updateMany(
        { _id: { $in: user.addresses } },
        { $set: { isDefault: false } }
      );
    }

    // Create new address document
    const newAddress = await this.addressModel.create({
      ...dto,
      userId, // optional if needed
    });

    // Add reference id to User
    user.addresses.push(newAddress._id);
    await user.save();

    return newAddress;
  }


  async updateAddress(userId: string, addressId: string, dto: Partial<Address>) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Check if this address belongs to this user
    if (!user.addresses.includes(addressId as any)) {
      throw new NotFoundException('Address not found for this user');
    }

    if (dto.isDefault) {
      // unset previous default
      await this.addressModel.updateMany(
        { _id: { $in: user.addresses } },
        { $set: { isDefault: false } }
      );
    }

    // Update actual address document
    const updated = await this.addressModel.findByIdAndUpdate(
      addressId,
      dto,
      { new: true }
    );

    if (!updated) throw new NotFoundException('Address not found');

    return updated;
  }


  async removeAddress(userId: string, addressId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!user.addresses.includes(addressId as any)) {
      throw new NotFoundException('Address not found for this user');
    }

    // Remove ObjectId reference from user
    user.addresses = user.addresses.filter(id => id.toString() !== addressId);
    await user.save();

    // Remove actual Address document
    await this.addressModel.findByIdAndDelete(addressId);
  }


  async getAddresses(userId: string): Promise<Address[]> {
    const user = await this.userModel.findById(userId).populate({ path: 'addresses', model: 'Address' });
    if (!user) throw new NotFoundException('User not found');
    debugger
    return user.addresses as any;
  }


  async getDefaultAddress(userId: string): Promise<Address | null> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return await this.addressModel.findOne({
      _id: { $in: user.addresses },
      isDefault: true
    }) || await this.addressModel.findOne({ _id: { $in: user.addresses } });
  }

}

