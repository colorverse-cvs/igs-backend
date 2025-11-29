import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';
import { Address, AddressSchema } from './address.entity';
import { ProfileDto } from '../dto';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
// @Schema({ timestamps: true, _id: false }) // disable default ObjectId
export class User extends Document {
  // @Prop({ default: () => uuidv4() })
  // id: string; // UUID instead of Mongo ObjectId

  @Prop({ required: true, unique: true })
  email: string;

  @Prop() firstName?: string;

  @Prop() lastName?: string;
  
  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['admin', 'customer'], default: 'customer' })
  role: string;

  @Prop({ type: Object, default: {} })
  profile: ProfileDto;

  @Prop({ type: [AddressSchema], default: [] })
  addresses?: Address[];

}
export const UserSchema = SchemaFactory.createForClass(User);

// // ✅ Virtual `id` getter for consistent API
// UserSchema.virtual('id').get(function (this: any) {
//   return this._id;
// });

// UserSchema.set('toJSON', {
//   virtuals: true,
// });
