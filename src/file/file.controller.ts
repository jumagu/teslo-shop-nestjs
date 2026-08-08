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

import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';

import { createReadStream } from 'fs';

import { memoryStorage } from 'multer';

import { FileService } from './file.service';
import { FileRenamerPipe } from './pipes';
import { getFileMimeType } from './helpers';

@ApiTags('Files')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload/product')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Default multer value. It's left this way for clarity.
    }),
  )
  @ApiOperation({
    summary: 'Upload a product image',
    description:
      'Accepts a single image, renames it to a UUID and stores it under `uploads/products`. Not authenticated.',
  })
  // `@UploadedFile()` is invisible to the schema explorer — without `@ApiBody`
  // the endpoint would render with no request body at all.
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Multipart form containing the image.',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file. Allowed MIME types: image/png, image/jpeg, image/jpg, image/gif.',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'File stored.',
    schema: {
      type: 'object',
      properties: {
        secureUrl: {
          type: 'string',
          format: 'uri',
          example: 'http://localhost:3000/api/files/product/6f0e5b0e-1c3a-4c2f-9a7e-2b1d3c4e5f60.jpeg',
        },
      },
      required: ['secureUrl'],
    },
  })
  @ApiBadRequestResponse({ description: 'File missing, or MIME type not one of [png, jpeg, jpg, gif].' })
  @ApiInternalServerErrorResponse({ description: 'The file could not be written to disk.' })
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
  @ApiOperation({
    summary: 'Download a product image',
    description: 'Streams the stored image inline. Not authenticated.',
  })
  @ApiParam({
    name: 'fileName',
    description: 'Stored file name as returned by the upload endpoint.',
    example: '6f0e5b0e-1c3a-4c2f-9a7e-2b1d3c4e5f60.jpeg',
  })
  @ApiProduces('image/jpeg', 'image/png', 'image/gif')
  // An explicit `content` map (rather than `type`) is what makes the UI offer a download.
  @ApiOkResponse({
    description: 'Image stream (Content-Disposition: inline).',
    content: {
      'image/jpeg': { schema: { type: 'string', format: 'binary' } },
      'image/png': { schema: { type: 'string', format: 'binary' } },
      'image/gif': { schema: { type: 'string', format: 'binary' } },
    },
  })
  @ApiBadRequestResponse({
    description: 'No stored file with that name. Note: this endpoint returns 400, not 404.',
  })
  async getProductFile(@Param('fileName') fileName: string): Promise<StreamableFile> {
    const path = await this.fileService.getProductFile(fileName);

    const stream = createReadStream(path);

    return new StreamableFile(stream, {
      type: getFileMimeType(fileName),
      disposition: `inline; filename="${fileName}"`,
    });
  }
}
