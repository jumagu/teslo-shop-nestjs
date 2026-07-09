import {
  Logger,
  Injectable,
  HttpException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { CreateProductDto, FindAllProductsDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger('ProductService', { timestamp: true });

  constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);

      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.handleTypeormError(error);
    }
  }

  async findAll(findAllProductsDto: FindAllProductsDto) {
    const { limit = 10, offset = 0 } = findAllProductsDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
    });

    return products;
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Product with id '${id}' not found.`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    try {
      const result = await this.productRepository.delete({ id });

      if (result.affected === 0) {
        throw new NotFoundException(`Product with id '${id}' not found.`);
      }

      return {
        ok: true,
        message: 'Product successfully deleted.',
      };
    } catch (error) {
      this.handleTypeormError(error);
    }
  }

  private handleTypeormError(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    if (error instanceof HttpException) throw error;

    this.logger.error(error);
    throw new InternalServerErrorException('Operation could not be completed. Please contact the administrator.');
  }
}
