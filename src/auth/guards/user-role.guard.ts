import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import { META_ROLES } from '../decorators';
import type { User } from '../entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {} // ? Reflector helps to see metadata of the target method

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const allowedRoles: string[] | undefined = this.reflector.get(META_ROLES, context.getHandler());

    if (!allowedRoles) return true;
    if (allowedRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      throw new BadRequestException('The user is not in the request.');
    }

    for (const role of user.roles) {
      if (allowedRoles.includes(role)) return true;
    }

    throw new ForbiddenException(
      `User ${user.fullName} does not have the necessary permissions to perform this action. Current roles: ${user.roles.join(', ')}. Please contact an administrator.`,
    );
  }
}
