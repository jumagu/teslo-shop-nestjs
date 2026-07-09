import { PartialType } from '@nestjs/mapped-types';

import { PaginationDto } from 'src/common/dto';

export class FindAllProductsDto extends PartialType(PaginationDto) {}
