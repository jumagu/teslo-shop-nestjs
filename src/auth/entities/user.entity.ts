import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import { Product } from 'src/product/entities';

@Entity()
export class User {
  @ApiProperty({
    description: 'Auto-generated user identifier.',
    format: 'uuid',
    example: 'd6a0f6a2-8f1b-4c3d-9e5a-7b2c1d0e4f60',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Unique login email. Normalised to lower case on save.',
    format: 'email',
    example: 'juan@gmail.com',
  })
  @Column('text', { unique: true })
  email: string;

  @ApiHideProperty()
  @Column('text', { select: false })
  password: string;

  @ApiProperty({ description: "User's display name.", example: 'Juan' })
  @Column('text')
  fullName: string;

  @ApiProperty({
    description: 'Inactive users are rejected with 403 during token validation.',
    example: true,
  })
  @Column('bool', { default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Roles granted to the user.',
    type: [String],
    enum: ['admin', 'super-user', 'user'],
    example: ['user'],
  })
  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @ApiHideProperty()
  @OneToMany(() => Product, (product) => product.user)
  product: Product;

  @BeforeInsert()
  @BeforeUpdate()
  validateEmail() {
    this.email = this.email.toLowerCase();
  }
}
