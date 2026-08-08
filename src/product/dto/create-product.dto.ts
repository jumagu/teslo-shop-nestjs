import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, Matches, MinLength } from 'class-validator';

export class CreateProductDto {
  @ApiPropertyOptional({
    description: 'URL-friendly identifier. Derived from `title` when omitted.',
    example: 'mens-chill-crew-neck-sweatshirt',
  })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and single hyphens between words.',
  })
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Display name. Must be unique.',
    example: "Men's Chill Crew Neck Sweatshirt",
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({
    description: 'Long-form product copy.',
    example: 'Premium heavyweight exterior with a soft fleece interior.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  // `@IsPositive` maps to `minimum: 1`, but the validator accepts 0.5 on a float column.
  @ApiPropertyOptional({
    description: 'Price in USD.',
    minimum: 0,
    exclusiveMinimum: true,
    example: 75,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: 'Units available in inventory.', minimum: 1, example: 7 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'Available sizes.',
    type: [String],
    example: ['XS', 'S', 'M', 'L', 'XL'],
  })
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  // No `@ApiProperty` needed — `@IsIn` already yields the enum via `classValidatorShim`.
  @IsIn(['men', 'women', 'kids', 'unisex'])
  gender: string;

  @ApiPropertyOptional({
    description: 'Free-form search tags.',
    type: [String],
    example: ['sweatshirt', 'winter'],
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Image **file names** returned by POST /api/files/upload/product — not full URLs.',
    type: [String],
    example: ['1740176-00-A_0_2000.jpg', '1740176-00-A_1.jpg'],
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}
