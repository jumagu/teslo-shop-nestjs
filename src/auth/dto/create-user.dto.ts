import { IsString, MinLength } from 'class-validator';

import { SignInUserDto } from './sign-in-user.dto';

export class CreateUserDto extends SignInUserDto {
  @IsString()
  @MinLength(1)
  fullName: string;
}
