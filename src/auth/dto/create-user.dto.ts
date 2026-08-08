import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

import { SignInUserDto } from './sign-in-user.dto';

export class CreateUserDto extends SignInUserDto {
  @ApiProperty({ description: "User's display name.", minLength: 1, example: 'Juan Gutiérrez' })
  @IsString()
  @MinLength(1)
  fullName: string;
}
