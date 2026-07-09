import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  // @Type(() => Number) // enableImplicitConversion: true
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
