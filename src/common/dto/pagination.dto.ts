import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Maximum number of records to return.',
    minimum: 1,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  // @Type(() => Number) // enableImplicitConversion: true
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of records to skip before collecting results.',
    minimum: 0,
    default: 0,
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
