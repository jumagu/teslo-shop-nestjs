import { FileInterceptor } from '@nestjs/platform-express';
import {
  Get,
  Post,
  Param,
  Controller,
  StreamableFile,
  UploadedFile,
  ParseFilePipe,
  UseInterceptors,
  FileTypeValidator,
} from '@nestjs/common';

import { createReadStream } from 'fs';

import { memoryStorage } from 'multer';

import { FileService } from './file.service';
import { FileRenamerPipe } from './pipes';
import { getFileMimeType } from './helpers';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload/product')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Default multer value. It's left this way for clarity.
    }),
  )
  uploadProductFile(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new FileTypeValidator({
            fileType: /^image\/(png|jpeg|jpg|gif)$/,
            errorMessage: 'File extension must be one of: [png, jpeg, jpg, gif]',
          }),
        ],
      }),
      FileRenamerPipe, // Custom pipe
    )
    file: Express.Multer.File,
  ) {
    return this.fileService.uploadProductFile(file);
  }

  @Get('product/:fileName')
  async getProductFile(@Param('fileName') fileName: string): Promise<StreamableFile> {
    const path = await this.fileService.getProductFile(fileName);

    const stream = createReadStream(path);

    return new StreamableFile(stream, {
      type: getFileMimeType(fileName),
      disposition: `inline; filename="${fileName}"`,
    });
  }
}
