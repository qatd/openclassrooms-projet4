import { User } from '@prisma/client';
import { HttpError } from '../errors/http-error';
import { UserRepository } from '../repositories/user.repository';

const userRepository = new UserRepository();

// Response sent to the client: never includes the password
const toUserResponse = (user: User) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  admin: user.admin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// Business rules for users: own account deletion, admin self-promotion (development only)
export class UserService {
  async findById(id: number) {
    const user = await this.getExistingUser(id);
    return toUserResponse(user);
  }

  async delete(currentUserId: number | undefined, id: number) {
    if (currentUserId !== id) {
      throw new HttpError(403, 'You can only delete your own account');
    }

    await this.getExistingUser(id);
    await userRepository.delete(id);
  }

  async promoteToAdmin(currentUserId: number | undefined) {
    const isDev = (process.env.NODE_ENV || 'development') === 'development';
    if (!isDev) {
      throw new HttpError(403, 'Admin self-promotion is only available in development');
    }

    // Always set by authMiddleware: this check lets TypeScript know it's a number
    if (!currentUserId) {
      throw new HttpError(401, 'Unauthorized');
    }

    const user = await this.getExistingUser(currentUserId);

    if (user.admin) {
      return toUserResponse(user);
    }

    const updatedUser = await userRepository.update(user.id, { admin: true });
    return toUserResponse(updatedUser);
  }

  private async getExistingUser(id: number) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    return user;
  }
}
