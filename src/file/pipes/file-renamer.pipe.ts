import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { v4 as uuid } from 'uuid';

@Injectable()
export class FileRenamerPipe implements PipeTransform<Express.Multer.File, Express.Multer.File> {
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const fileExtension = file.mimetype.split('/').at(1)!;

    file.filename = `${uuid()}.${fileExtension}`;

    return file;
  }
}
