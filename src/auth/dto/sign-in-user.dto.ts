import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SignInUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S+$/, {
    message: 'Password must include an uppercase letter, a lowercase letter, a number, and a symbol.',
  })
  password: string;
}
