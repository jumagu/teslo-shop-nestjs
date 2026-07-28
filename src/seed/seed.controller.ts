import { Controller, Get } from '@nestjs/common';

import { SeedService } from './seed.service';

import { Auth } from 'src/auth/decorators';
import { UserRole } from 'src/auth/enums';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @Auth(UserRole.superUser)
  execute() {
    return this.seedService.execute();
  }
}
