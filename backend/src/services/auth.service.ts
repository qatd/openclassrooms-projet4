import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { RegisterDto } from '../dto/auth.dto';
import { HttpError } from '../errors/http-error';
import { UserRepository } from '../repositories/user.repository';
import { generateToken } from '../utils/jwt.util';

const userRepository = new UserRepository();

// Response sent after login or register: the user (without the password) and its token
const toAuthResponse = (user: User, token: string) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  admin: user.admin,
  token,
});

// Business rules for authentication: credentials check, password hashing, token generation
export class AuthService {
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new HttpError(401, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpError(401, 'Invalid credentials');
    }

    return toAuthResponse(user, generateToken(user.id));
  }

  async register(data: RegisterDto) {
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new HttpError(400, 'Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      admin: false,
    });

    return toAuthResponse(user, generateToken(user.id));
  }
}
