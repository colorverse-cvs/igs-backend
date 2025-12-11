import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';
import { Address, AddressSchema } from './address.entity';
import { ProfileDto } from '../dto';

@Schema()
export class Phone {
  @Prop({ type: String, required: true })
  number: string; // E.164 preferred, e.g. +14155552671

  @Prop({ type: String, default: '+91' })
  countryCode?: string;

  @Prop({ type: Boolean, default: false })
  isPrimary?: boolean;

  @Prop({ type: Boolean, default: false })
  verified?: boolean;

  @Prop({ type: String, enum: ['mobile', 'home', 'work', 'other'], default: 'mobile' })
  label?: 'mobile' | 'home' | 'work' | 'other';
}

export type PhoneDocument = Phone & Document;
export const PhoneSchema = SchemaFactory.createForClass(Phone);

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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Address' }], default: [] })
  addresses: Address[];

  // Add phones array to store any number of phone entries.
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Phone' }], default: [] })
  phones?: Phone[];

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: number;

}
export const UserSchema = SchemaFactory.createForClass(User);

// ensure at most one primary phone and set a default primary if none
UserSchema.pre('save', function (next) {
  // 'this' is the document being saved
  const doc: any = this;
  if (!doc.phones || !Array.isArray(doc.phones) || doc.phones.length === 0) return next();

  // ensure only one primary: keep the first primary, unset others
  let foundPrimary = false;
  for (const p of doc.phones) {
    if (p.isPrimary) {
      if (!foundPrimary) foundPrimary = true;
      else p.isPrimary = false;
    }
  }

  // if no primary found, mark the first phone as primary
  if (!foundPrimary && doc.phones.length > 0) {
    doc.phones[0].isPrimary = true;
  }

  return next();
});

// // ✅ Virtual `id` getter for consistent API
// UserSchema.virtual('id').get(function (this: any) {
//   return this._id;
// });

// UserSchema.set('toJSON', {
//   virtuals: true,
// });
