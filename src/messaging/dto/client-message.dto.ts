import { IsString, MinLength } from 'class-validator';

export class ClientMessageDto {
  @IsString()
  @MinLength(1)
  message: string;
}
