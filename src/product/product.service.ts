import {
  Logger,
  Injectable,
  HttpException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isUUID } from 'class-validator';
import { DataSource, Repository } from 'typeorm';

import { Product, ProductImage } from './entities';
import { CreateProductDto, FindAllProductsDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger('ProductService', { timestamp: true });

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage) private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...rest } = createProductDto;

      const product = this.productRepository.create({
        ...rest,
        images: images.map((url) => this.productImageRepository.create({ url })),
      });

      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleTypeormError(error);
    }
  }

  async findAll(findAllProductsDto: FindAllProductsDto) {
    const { limit = 10, offset = 0 } = findAllProductsDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      // ? This is not necessary since the entity already has `eager: true` on the relation
      // relations: {
      //   images: true,
      // },
    });

    return products.map(this.flattenProduct);
  }

  async findOne(term: string) {
    let product: Product | null;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');
      product = await queryBuilder
        .where('LOWER(title)=:title or slug=:slug', { title: term.toLowerCase(), slug: term })
        .leftJoinAndSelect('product.images', 'productImages')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with id, name or slug '${term}' not found.`);
    }

    return this.flattenProduct(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...productRest } = updateProductDto;

    const updatedProduct = await this.productRepository.preload({
      id,
      ...productRest,
    });

    if (!updatedProduct) {
      throw new NotFoundException(`Product with id '${id}' not found.`);
    }

    // Query runner - Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        updatedProduct.images = images.map((url) => this.productImageRepository.create({ url }));
      } else {
        updatedProduct.images = await this.productImageRepository.findBy({ product: { id } });
      }

      await queryRunner.manager.save(updatedProduct);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.flattenProduct(updatedProduct);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleTypeormError(error);
    }
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

  private flattenProduct(product: Product) {
    return {
      ...product,
      images: product.images.map((img) => img.url),
    };
  }

  private handleTypeormError(error: any): never {
    // ? Duplicate key error
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    if (error instanceof HttpException) throw error;

    this.logger.error(error);
    throw new InternalServerErrorException('Operation could not be completed. Please contact the administrator.');
  }
}
