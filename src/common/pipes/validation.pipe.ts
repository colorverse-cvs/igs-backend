import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!metadata.metatype || this.isPrimitive(metadata.metatype)) {
      return value;
    }

    const object = plainToInstance(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException(errors.map((e) => Object.values(e.constraints)).flat());
    }
    return object;
  }

  private isPrimitive(metatype: any): boolean {
    const primitives = [String, Boolean, Number, Array, Object];
    return primitives.includes(metatype);
  }
}
