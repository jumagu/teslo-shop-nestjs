import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { ProductService } from './product.service';
import { CreateProductDto, FindAllProductsDto, UpdateProductDto } from './dto';

import { User } from 'src/auth/entities';
import { UserRole } from 'src/auth/enums';
import { Auth, GetUser } from 'src/auth/decorators';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Auth(UserRole.admin)
  create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
    return this.productService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() findAllProductsDto: FindAllProductsDto) {
    return this.productService.findAll(findAllProductsDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productService.findOne(term);
  }

  @Patch(':id')
  @Auth(UserRole.admin)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Auth(UserRole.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.remove(id);
  }
}
