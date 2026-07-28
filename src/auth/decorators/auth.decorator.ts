import { AuthGuard } from '@nestjs/passport';
import { applyDecorators, UseGuards } from '@nestjs/common';

import { UserRoleGuard } from '../guards';
import { RoleProtected } from './role-protected.decorator';
import type { UserRole } from '../enums';

export const Auth = (...roles: UserRole[]) => {
  return applyDecorators(RoleProtected(...roles), UseGuards(AuthGuard(), UserRoleGuard));
};
