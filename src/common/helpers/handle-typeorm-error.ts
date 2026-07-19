import { Logger, HttpException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

export function handleTypeormError(error: any, logger: Logger): never {
  // ? Duplicate key error
  if (error.code === '23505') {
    throw new BadRequestException(error.detail);
  }

  if (error instanceof HttpException) throw error;

  logger.error(error);
  throw new InternalServerErrorException('Operation could not be completed. Please contact the administrator.');
}
