import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SignInUserDto {
  @ApiProperty({
    description: 'Account email. Normalised to lower case on save.',
    example: 'juan@gmail.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Must contain an uppercase letter, a lowercase letter, a digit and a symbol, with no whitespace.',
    example: 'Abc123*',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S+$/, {
    message: 'Password must include an uppercase letter, a lowercase letter, a number, and a symbol.',
  })
  password: string;
}
