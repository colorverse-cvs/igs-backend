import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from './schemas/banner.entity';
import { AddTextsDto } from './dto/add-texts.dto';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class MarketingService {
  constructor(
    @InjectModel(Banner.name) private readonly bannerModel: Model<BannerDocument>,
  ) {}

  // ─── Internal Helper ───────────────────────────────────────────────────────

  /**
   * Returns the single Banner document, creating an empty one if it doesn't
   * exist yet (singleton / upsert pattern).
   */
  private async getOrCreateBanner(): Promise<BannerDocument> {
    let banner = await this.bannerModel.findOne().exec();
    if (!banner) {
      banner = await this.bannerModel.create({ imageUrl: null, imageFilename: null, texts: [] });
    }
    return banner;
  }

  /**
   * Deletes a banner image file from disk. Silently ignores missing files.
   */
  private async unlinkBannerFile(filename: string | null): Promise<void> {
    if (!filename) return;
    const filePath = join(process.cwd(), 'uploads', 'banners', filename);
    await fs.unlink(filePath).catch(() => null);
  }

  // ─── Banner Image ───────────────────────────────────────────────────────────

  /**
   * Stores a new banner image. If one already exists the old file is deleted
   * from disk before the new record is saved (replace semantics).
   */
  async uploadBannerImage(file: Express.Multer.File): Promise<{ imageUrl: string; imageFilename: string }> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const banner = await this.getOrCreateBanner();

    // Remove old image from disk if replacing
    await this.unlinkBannerFile(banner.imageFilename);

    banner.imageUrl = `/public/banners/${file.filename}`;
    banner.imageFilename = file.filename;
    await banner.save();

    return { imageUrl: banner.imageUrl, imageFilename: banner.imageFilename };
  }

  /**
   * Returns the current banner image URL, or null if no image has been set.
   */
  async getBannerImage(): Promise<{ imageUrl: string | null }> {
    const banner = await this.getOrCreateBanner();
    return { imageUrl: banner.imageUrl };
  }

  /**
   * Removes the banner image from disk and clears the image fields on the
   * document. Throws 404 if no image is currently set.
   */
  async deleteBannerImage(): Promise<{ message: string }> {
    const banner = await this.getOrCreateBanner();

    if (!banner.imageUrl) {
      throw new NotFoundException('No banner image is currently set');
    }

    await this.unlinkBannerFile(banner.imageFilename);

    banner.imageUrl = null;
    banner.imageFilename = null;
    await banner.save();

    return { message: 'Banner image deleted successfully' };
  }

  // ─── Promotional Strip Texts ────────────────────────────────────────────────

  /**
   * Appends one or more text items to the promotional strip texts array.
   */
  async addTexts(addTextsDto: AddTextsDto): Promise<{ texts: string[] }> {
    const banner = await this.getOrCreateBanner();
    banner.texts.push(...addTextsDto.texts);
    await banner.save();
    return { texts: banner.texts };
  }

  /**
   * Returns all current promotional strip text items.
   */
  async getTexts(): Promise<{ texts: string[] }> {
    const banner = await this.getOrCreateBanner();
    return { texts: banner.texts };
  }

  /**
   * Deletes a single promotional strip text item by its zero-based array index.
   * Throws 404 if the index is out of range.
   */
  async deleteTextByIndex(index: number): Promise<{ texts: string[] }> {
    const banner = await this.getOrCreateBanner();

    if (index < 0 || index >= banner.texts.length) {
      throw new NotFoundException(
        `Text item at index ${index} not found. Current array has ${banner.texts.length} item(s).`,
      );
    }

    banner.texts.splice(index, 1);
    // Mark the array as modified so Mongoose persists the change
    banner.markModified('texts');
    await banner.save();

    return { texts: banner.texts };
  }
}
