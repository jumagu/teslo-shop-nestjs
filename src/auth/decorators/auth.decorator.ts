import { AuthGuard } from '@nestjs/passport';
import { applyDecorators, UseGuards } from '@nestjs/common';

import { UserRole } from '../enums';
import { UserRoleGuard } from '../guards';
import { RoleProtected } from './role-protected.decorator';

export const Auth = (...roles: UserRole[]) => {
  return applyDecorators(RoleProtected(...roles), UseGuards(AuthGuard(), UserRoleGuard));
};
