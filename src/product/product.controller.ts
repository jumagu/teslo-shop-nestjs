import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { ProductService } from './product.service';
import { CreateProductDto, FindAllProductsDto, UpdateProductDto } from './dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
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
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.remove(id);
  }
}
