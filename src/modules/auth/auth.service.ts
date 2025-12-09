import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.entity';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto';
import { UserResponseDto } from './dto/register-response.dto';
import { User } from '../users/schemas/user.entity';

@Injectable()
export class AuthService {
  private accessTokenExpiresIn: string;
  private refreshTokenExpiresDays: number;
  private refreshTokenTTLms: number;

  constructor(
    private readonly usersService: UsersService,
    @InjectModel(RefreshToken.name) private readonly refreshModel: Model<RefreshTokenDocument>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.accessTokenExpiresIn = this.config.get<string>('app.jwtAccessExpiresIn') || '15m';
    // refresh token lifetime in days or value from config
    this.refreshTokenExpiresDays = parseInt(this.config.get<string>('app.refreshTokenDays') || '30', 10);
    this.refreshTokenTTLms = this.refreshTokenExpiresDays * 24 * 60 * 60 * 1000;
  }

  // validate credentials against user record (UsersService must implement findOneByEmail)
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) return null;

    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    // sanitize user object if needed
    const { password: _p, ...safeUser } = (user as any).toObject ? (user as any).toObject() : user;
    return safeUser;
  }

  // main login: returns access + refresh tokens
  async login(user: User): Promise<UserResponseDto> {
    const userId = user?._id ? user?._id.toString() : user.id || user?._id;
    if (!userId) throw new BadRequestException('Invalid user object');

    const accessToken = this.createAccessToken({ sub: userId, role: user.role, email: user.email });
    const refreshToken = await this.createAndStoreRefreshToken(userId);

    return {
      id: userId,
      email: user.email,
      role: user.role as any,
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpiresIn,
      refreshExpiresInDays: this.refreshTokenExpiresDays,
    };
  }

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, role } = createUserDto;


    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const newUser = await this.usersService.create({ email, password, role });
    const payload = { sub: newUser._id, email: newUser.email, role: newUser.role };
    const accessToken = this.createAccessToken(payload);
    const refreshToken = await this.createAndStoreRefreshToken(newUser._id);

    return {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role as any,
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpiresIn,
      refreshExpiresInDays: this.refreshTokenExpiresDays,
    };
  }


  createAccessToken(payload: Record<string, any>) {
    return this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiresIn,
    } as any);
  }

  // generate secure refresh token, hash it, store, and return raw token
  private async createAndStoreRefreshToken(userId: string) {
    const rawToken = randomBytes(48).toString('hex'); // 96 chars
    const hashed = await bcrypt.hash(rawToken, 12);

    const expiresAt = new Date(Date.now() + this.refreshTokenTTLms);

    const doc = await this.refreshModel.create({
      user: new Types.ObjectId(userId),
      token: hashed,
      expiresAt,
    });

    // Optional: limit number of active tokens per user (e.g., keep last 5)
    await this.pruneOldTokens(userId, 10);

    return rawToken;
  }

  // Remove oldest tokens if exceed limit (optional housekeeping)
  private async pruneOldTokens(userId: string, keep = 10) {
    const tokens = await this.refreshModel.find({ user: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).skip(keep);
    if (tokens.length) {
      const ids = tokens.map(t => t._id);
      await this.refreshModel.deleteMany({ _id: { $in: ids } });
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const tokens = await this.refreshModel.find({ user: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
    for (const t of tokens) {
      const match = await bcrypt.compare(refreshToken, t.token);
      if (!match) continue;
      if (t.expiresAt.getTime() < Date.now()) {
        await this.refreshModel.deleteOne({ _id: t._id });
        throw new UnauthorizedException('Refresh token expired');
      }

      // rotate refresh token: issue new refresh token and replace DB entry (optional)
      const newRaw = randomBytes(48).toString('hex');
      const newHashed = await bcrypt.hash(newRaw, 12);
      t.token = newHashed;
      t.expiresAt = new Date(Date.now() + this.refreshTokenTTLms);
      await t.save();

      const accessToken = this.createAccessToken({ sub: userId });
      return {
        accessToken,
        refreshToken: newRaw,
      };
    }
    throw new UnauthorizedException('Invalid refresh token');
  }

  // logout: remove refresh token
  async logout(userId: string, refreshToken: string) {
    const tokens = await this.refreshModel.find({ user: new Types.ObjectId(userId) });
    for (const t of tokens) {
      const match = await bcrypt.compare(refreshToken, t.token);
      if (match) {
        await this.refreshModel.deleteOne({ _id: t._id });
        return { success: true };
      }
    }
    // If token not found, just return success (idempotent)
    return { success: true };
  }

  // revoke all refresh tokens for a user (logout everywhere)
  async revokeAllForUser(userId: string) {
    await this.refreshModel.deleteMany({ user: new Types.ObjectId(userId) });
    return { success: true };
  }


  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');

    // Save hashed token to DB
    user.resetPasswordToken = createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 minutes
    await user.save();

    // TODO: Send email — placeholder
    // await emailService.sendResetLink(user.email, token);

    return {
      message: 'Reset link generated',
      resetToken: token, // ← You can show token for testing
    };
  }

  async resetPassword(dto: { token: string; newPassword: string }) {
    const { token, newPassword } = dto;
    const hashedToken = createHash('sha256').update(token).digest('hex');

    const user = await this.usersService.findOneByField({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Check expiry
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return { message: 'Password updated successfully' };
  }

}
