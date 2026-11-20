import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';
import { parseId } from '../utils/parse-id';

const userService = new UserService();

export class UserController {
  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };

    const user = await userService.findById(parseId(id, 'User'));

    return res.status(200).json(user);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };

    await userService.delete(req.userId, parseId(id, 'User'));

    return res.status(200).json({ message: 'User deleted successfully' });
  }

  async promoteSelfToAdmin(req: AuthRequest, res: Response) {
    const user = await userService.promoteToAdmin(req.userId);

    return res.status(200).json(user);
  }
}
