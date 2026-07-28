import { createParamDecorator, InternalServerErrorException } from '@nestjs/common';

import type { User } from '../entities/user.entity';

type UserProps = keyof Omit<User, 'validateEmail' | 'password'>;

/**
 * This decorator was created for purely educational purposes to help
 * understand how parameter decorators work. It has no real usefulness.
 */
export const GetUser = createParamDecorator((data: UserProps, context) => {
  // ? context is an object that describes the state of the app's at this exact moment.
  const request = context.switchToHttp().getRequest();
  const user = request.user;

  if (!user) {
    throw new InternalServerErrorException('The user is not in the request.');
  }

  return data ? user[data] : user;
});
