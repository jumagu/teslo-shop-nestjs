import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Product } from './entities';
import { ProductService } from './product.service';
import { CreateProductDto, FindAllProductsDto, UpdateProductDto } from './dto';

import { User } from 'src/auth/entities';
import { UserRole } from 'src/auth/enums';
import { Auth, GetUser } from 'src/auth/decorators';

// ? Auto-tagging would yield the singular `Product`, which does not bind to the
// ? `Products` tag description declared in the DocumentBuilder.
@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Auth(UserRole.admin)
  @ApiOperation({
    summary: 'Create a product',
    description: 'Creates a product and links it to the authenticated user. Requires the `admin` role.',
  })
  @ApiCreatedResponse({ description: 'Product created.', type: Product })
  @ApiBadRequestResponse({ description: 'Validation failed, or slug/title already taken (Postgres 23505).' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected database error.' })
  create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
    return this.productService.create(createProductDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'List products',
    description: 'Paginated catalog listing. Defaults: limit 10, offset 0.',
  })
  @ApiOkResponse({ description: 'Paginated list of products.', type: [Product] })
  @ApiBadRequestResponse({ description: 'Invalid `limit` or `offset`.' })
  findAll(@Query() findAllProductsDto: FindAllProductsDto) {
    return this.productService.findAll(findAllProductsDto);
  }

  @Get(':term')
  @ApiOperation({
    summary: 'Find one product',
    description: 'Resolves by UUID, exact title (case-insensitive) or slug.',
  })
  @ApiParam({
    name: 'term',
    description: 'Product UUID, title or slug.',
    example: 'mens-chill-crew-neck-sweatshirt',
  })
  @ApiOkResponse({ description: 'Product found.', type: Product })
  @ApiNotFoundResponse({ description: 'No product matches the term.' })
  findOne(@Param('term') term: string) {
    return this.productService.findOne(term);
  }

  @Patch(':id')
  @Auth(UserRole.admin)
  @ApiOperation({
    summary: 'Update a product',
    description: 'Partial update. Sending `images` replaces the entire image set. Requires the `admin` role.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID.', format: 'uuid' })
  @ApiOkResponse({ description: 'Product updated.', type: Product })
  @ApiBadRequestResponse({ description: 'Invalid UUID, validation failure, or duplicate slug/title.' })
  @ApiNotFoundResponse({ description: 'No product with that id.' })
  @ApiInternalServerErrorResponse({
    description: 'Transaction rolled back after an unexpected database error.',
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Auth(UserRole.admin)
  @ApiOperation({
    summary: 'Delete a product',
    description: 'Permanently removes a product and, by cascade, its images. Requires the `admin` role.',
  })
  @ApiParam({ name: 'id', description: 'Product UUID.', format: 'uuid' })
  @ApiOkResponse({
    description: 'Product deleted.',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Product successfully deleted.' },
      },
      required: ['ok', 'message'],
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid UUID.' })
  @ApiNotFoundResponse({ description: 'No product with that id.' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected database error.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.remove(id);
  }
}
