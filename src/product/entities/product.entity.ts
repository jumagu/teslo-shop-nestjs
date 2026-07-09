import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { slugify } from 'src/common/utils/slugify.util';
import { ProductImage } from './product-image.entity';

@Entity()
export class Product {
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

  @Column('text')
  gender: string;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @OneToMany(() => ProductImage, (productImage) => productImage.product, { cascade: true, eager: true })
  images: ProductImage[];

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
