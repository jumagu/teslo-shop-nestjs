import { InjectRepository } from '@nestjs/typeorm';
import { Logger, Injectable, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto, SignInUserDto } from './dto';

import { handleTypeormError } from 'src/common/helpers';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService', { timestamp: true });

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const { password, ...rest } = createUserDto;

      const user = this.userRepository.create({
        ...rest,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);

      return user;
    } catch (error) {
      handleTypeormError(error, this.logger);
    }
  }

  async signInUser(signInUserDto: SignInUserDto) {
    try {
      const { password, email } = signInUserDto;

      const user = await this.userRepository.findOne({
        where: { email },
        select: { email: true, password: true },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return {
        accessToken: 'XYZ-123',
      };
    } catch (error) {
      handleTypeormError(error, this.logger);
    }
  }
}
