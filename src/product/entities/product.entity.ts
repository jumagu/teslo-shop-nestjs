import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ProductImage } from './product-image.entity';

import { User } from 'src/auth/entities';
import { slugify } from 'src/common/utils';

@Entity()
export class Product {
  @ApiProperty({
    description: 'Auto-generated product identifier.',
    format: 'uuid',
    example: 'a4c86e59-c1ca-4125-a5c8-2c9c6b2e1876',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('text', { unique: true })
  title: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('float', { default: 0 })
  price: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column('text', { array: true })
  sizes: string[];

  @ApiProperty({
    description: 'Target audience.',
    enum: ['men', 'women', 'kids', 'unisex'],
    example: 'men',
  })
  @Column('text')
  gender: string;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @ApiProperty({
    type: [String],
    description:
      'Image file names. The ProductImage relation is flattened to a plain string array before the response is serialised.',
    example: ['1740176-00-A_0_2000.jpg', '1740176-00-A_1.jpg'],
  })
  @OneToMany(() => ProductImage, (productImage) => productImage.product, { cascade: true, eager: true })
  images: ProductImage[];

  @ApiPropertyOptional({
    type: () => User,
    description:
      'Owning user. Present on create/update and on lookup by UUID; absent when the product is resolved by title or slug.',
  })
  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @BeforeInsert()
  validateSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = slugify(this.slug);
  }

  @BeforeUpdate()
  validateSlugUpdate() {
    this.slug = slugify(this.slug);
  }
}
