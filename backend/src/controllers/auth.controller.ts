import { Request, Response } from 'express';
import { HttpError } from '../errors/http-error';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email) {
      throw new HttpError(400, 'Email is required');
    }
    if (!password) {
      throw new HttpError(400, 'Password is required');
    }
    if (typeof email !== 'string') {
      throw new HttpError(400, 'Email must be a string');
    }
    if (typeof password !== 'string') {
      throw new HttpError(400, 'Password must be a string');
    }

    const response = await authService.login(email, password);

    return res.status(200).json(response);
  }

  async register(req: Request, res: Response) {
    const { email, password, firstName, lastName } = req.body;

    if (!email) {
      throw new HttpError(400, 'Email is required');
    }
    if (!password) {
      throw new HttpError(400, 'Password is required');
    }
    if (!firstName) {
      throw new HttpError(400, 'First name is required');
    }
    if (!lastName) {
      throw new HttpError(400, 'Last name is required');
    }
    if (password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters');
    }

    const response = await authService.register({ email, password, firstName, lastName });

    return res.status(201).json(response);
  }
}
