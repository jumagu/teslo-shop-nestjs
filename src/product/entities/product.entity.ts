import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { slugify } from 'src/common/utils/slugify.util';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('text', { unique: true })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('float', { default: 0 })
  price: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column('text', { array: true })
  sizes: string[];

  @Column('text')
  gender: string;

  @BeforeInsert()
  validateSlug() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = slugify(this.slug);
  }
}
