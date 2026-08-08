import { Controller, Post, Body, Get } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { User } from './entities';
import { AuthService } from './auth.service';
import { Auth, GetUser } from './decorators';
import { CreateUserDto, SignInUserDto } from './dto';

// All three routes return the user entity with an `accessToken` appended.
// Composing with `allOf` keeps the `User` entity as the single source of truth.
const authResponseSchema = {
  allOf: [
    { $ref: getSchemaPath(User) },
    {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'JWT bearer token. Expires in 2 hours.',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['accessToken'],
    },
  ],
};

@ApiTags('Auth')
@ApiExtraModels(User)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a user',
    description: 'Creates a user with the default `user` role and returns it with a freshly signed JWT.',
  })
  @ApiCreatedResponse({ description: 'User created.', schema: authResponseSchema })
  @ApiBadRequestResponse({ description: 'Validation failure, or the email is already registered.' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected database error.' })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Log in',
    description:
      'Validates credentials and returns the user with a JWT. Note: responds **201**, the Nest default for POST — not 200.',
  })
  @ApiCreatedResponse({ description: 'Credentials accepted.', schema: authResponseSchema })
  @ApiBadRequestResponse({ description: 'Validation failure.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @ApiInternalServerErrorResponse({ description: 'Unexpected database error.' })
  signInUser(@Body() signInUserDto: SignInUserDto) {
    return this.authService.signInUser(signInUserDto);
  }

  @Get('check-status')
  @Auth()
  @ApiOperation({
    summary: 'Check token status',
    description: 'Validates the bearer token and returns the user with a newly issued token (sliding refresh).',
  })
  @ApiOkResponse({
    description: 'Token valid; a refreshed token is returned.',
    schema: authResponseSchema,
  })
  checkStatus(@GetUser() user: User) {
    return this.authService.checkStatus(user);
  }
}
