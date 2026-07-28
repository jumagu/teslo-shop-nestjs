import * as bcrypt from 'bcrypt';

export interface SeedUser {
  email: string;
  password: string;
  fullName: string;
  roles?: string[];
}

export const SEED_USERS: SeedUser[] = [
  {
    email: 'juan@gmail.com',
    password: bcrypt.hashSync('Abc123*', 10),
    fullName: 'Juan',
    roles: ['user', 'admin', 'super-user'],
  },
  {
    email: 'test@gmail.com',
    password: bcrypt.hashSync('Abc123*', 10),
    fullName: 'Test',
  },
];
