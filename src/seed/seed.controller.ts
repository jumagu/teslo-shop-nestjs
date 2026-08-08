import { Controller, Get } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @ApiOperation({
    summary: 'Reseed the database',
    description:
      '**DESTRUCTIVE.** Deletes every product and user, then reinserts the demo dataset. Local development only; this endpoint is not authenticated.',
  })
  // Returns a plain string, which Express sends as text/plain — the plugin would
  // otherwise document it under application/json.
  @ApiOkResponse({
    description: 'Seed completed.',
    content: { 'text/plain': { schema: { type: 'string', example: 'SEED EXECUTED' } } },
  })
  @ApiBadRequestResponse({
    description: 'Seeding failed; the database may be left in an inconsistent state.',
  })
  execute() {
    return this.seedService.execute();
  }
}
