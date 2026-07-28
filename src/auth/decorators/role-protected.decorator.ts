import { SetMetadata } from '@nestjs/common';

import type { UserRole } from '../enums';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: UserRole[]) => {
  return SetMetadata(META_ROLES, args);
};
