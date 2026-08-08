import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import { Product } from './product.entity';

@Entity()
export class ProductImage {
  @ApiProperty({ description: 'Auto-generated image identifier.', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Stored file name, served by GET /api/files/product/{fileName}.',
    example: '1740176-00-A_0_2000.jpg',
  })
  @Column('text')
  url: string;

  @ApiHideProperty()
  @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
  product: Product;
}
