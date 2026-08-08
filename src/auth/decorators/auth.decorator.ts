import { AuthGuard } from '@nestjs/passport';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { UserRoleGuard } from '../guards';
import { RoleProtected } from './role-protected.decorator';
import type { UserRole } from '../enums';

export const Auth = (...roles: UserRole[]) => {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRoleGuard),
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({
      description: 'Missing, malformed or expired JWT, or the user no longer exists.',
    }),
    ApiForbiddenResponse({
      description:
        roles.length > 0
          ? `Authenticated user is inactive, or lacks one of the required roles: ${roles.join(', ')}.`
          : 'Authenticated user is inactive.',
    }),
  );
};
