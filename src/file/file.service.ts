import { join } from 'path';
import { writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';

import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class FileService {
  private readonly productsFolder = join(process.cwd(), 'uploads', 'products');

  async uploadProductFile(file: Express.Multer.File) {
    this.ensureFolderExists(this.productsFolder);

    const destination = join(this.productsFolder, file.filename);

    try {
      await writeFile(destination, file.buffer);
    } catch {
      throw new InternalServerErrorException('Could not save the file.');
    }

    return {
      fileName: file.filename,
    };
  }

  async getProductFile(fileName: string) {
    const path = join(this.productsFolder, fileName);

    if (!existsSync(path)) {
      throw new BadRequestException(`Product file with name: '${fileName}' not found.`);
    }

    return path;
  }

  private ensureFolderExists(folder: string) {
    if (!existsSync(folder)) {
      mkdirSync(folder, { recursive: true });
    }
  }
}
