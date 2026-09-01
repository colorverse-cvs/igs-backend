import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { AddTextsDto } from './dto/add-texts.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Marketing')
@Controller('marketing/banner')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  // ─── Banner Image Endpoints ────────────────────────────────────────────────

  /**
   * POST /marketing/banner/image
   * Upload (or replace) the banner image. Admin only.
   */
  @Post('image')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Upload or replace the banner image (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Banner image file (jpg, jpeg, png, webp — max 5 MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Banner image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No file provided or invalid file type' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin role required' })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/banners',
        filename: (_req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          cb(null, `${uuidv4()}.${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new Error('Only jpg, jpeg, png, and webp images are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadBannerImage(@UploadedFile() file: Express.Multer.File) {
    return this.marketingService.uploadBannerImage(file);
  }

  /**
   * GET /marketing/banner/image
   * Retrieve the current banner image URL. Public.
   */
  @Get('image')
  @ApiOperation({ summary: 'Get the current banner image URL' })
  @ApiResponse({ status: 200, description: 'Banner image URL returned (null if not set)' })
  getBannerImage() {
    return this.marketingService.getBannerImage();
  }

  /**
   * DELETE /marketing/banner/image
   * Remove the banner image from disk and the database. Admin only.
   */
  @Delete('image')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete the banner image (Admin only)' })
  @ApiResponse({ status: 200, description: 'Banner image deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin role required' })
  @ApiResponse({ status: 404, description: 'No banner image is currently set' })
  deleteBannerImage() {
    return this.marketingService.deleteBannerImage();
  }

  // ─── Promotional Strip Text Endpoints ─────────────────────────────────────

  /**
   * POST /marketing/banner/texts
   * Add one or more promotional strip text items. Admin only.
   */
  @Post('texts')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Add promotional strip text items (Admin only)' })
  @ApiBody({ type: AddTextsDto })
  @ApiResponse({ status: 201, description: 'Text items added successfully' })
  @ApiResponse({ status: 400, description: 'Validation error — texts must be a non-empty string array' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin role required' })
  addTexts(@Body() addTextsDto: AddTextsDto) {
    return this.marketingService.addTexts(addTextsDto);
  }

  /**
   * GET /marketing/banner/texts
   * Retrieve all promotional strip text items. Public.
   */
  @Get('texts')
  @ApiOperation({ summary: 'Get all promotional strip text items' })
  @ApiResponse({ status: 200, description: 'List of promotional strip texts' })
  getTexts() {
    return this.marketingService.getTexts();
  }

  /**
   * DELETE /marketing/banner/texts/:index
   * Remove a single text item by its zero-based array index. Admin only.
   */
  @Delete('texts/:index')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete a promotional strip text item by index (Admin only)' })
  @ApiParam({
    name: 'index',
    type: Number,
    description: 'Zero-based index of the text item to delete',
    example: 0,
  })
  @ApiResponse({ status: 200, description: 'Text item deleted; updated texts array returned' })
  @ApiResponse({ status: 403, description: 'Forbidden — Admin role required' })
  @ApiResponse({ status: 404, description: 'Index out of range' })
  deleteTextByIndex(@Param('index', ParseIntPipe) index: number) {
    return this.marketingService.deleteTextByIndex(index);
  }
}
