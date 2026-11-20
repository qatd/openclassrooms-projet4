import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { HttpError } from '../errors/http-error';
import { UserRepository } from '../repositories/user.repository';

const userRepository = new UserRepository();

export class UserController {
  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };

    if (!id) {
      throw new HttpError(400, 'User ID is required');
    }

    const userId = parseInt(id);

    if (isNaN(userId)) {
      throw new HttpError(400, 'Invalid user ID');
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    const response: any = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json(response);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };

    if (!id) {
      throw new HttpError(400, 'User ID is required');
    }

    const userId = parseInt(id);

    if (isNaN(userId)) {
      throw new HttpError(400, 'Invalid user ID');
    }

    if (req.userId !== userId) {
      throw new HttpError(403, 'You can only delete your own account');
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    await userRepository.delete(userId);

    return res.status(200).json({ message: 'User deleted successfully' });
  }

  async promoteSelfToAdmin(req: AuthRequest, res: Response) {
    const isDev = (process.env.NODE_ENV || 'development') === 'development';
    if (!isDev) {
      throw new HttpError(403, 'Admin self-promotion is only available in development');
    }

    if (!req.userId) {
      throw new HttpError(401, 'Unauthorized');
    }

    const user = await userRepository.findById(req.userId);

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    if (user.admin) {
      return res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        admin: user.admin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    }

    const updatedUser = await userRepository.update(user.id, { admin: true });

    return res.status(200).json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      admin: updatedUser.admin,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  }
}
