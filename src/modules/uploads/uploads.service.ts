import { Injectable, BadRequestException } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class UploadService {
  private readonly uploadPath = join(process.cwd(), 'uploads');

  constructor() {
    // Ensure the uploads directory exists
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      message: 'File uploaded successfully',
      fileName: file.filename,
      path: `/public/${file.filename}`,
    };
  }
}
