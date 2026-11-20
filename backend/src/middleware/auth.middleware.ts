import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { HttpError } from '../errors/http-error';

export interface AuthRequest extends Request {
  userId?: number;
}

export function authMiddleware(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new HttpError(401, 'No token provided');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new HttpError(401, 'Invalid token format');
  }

  const decoded: any = verifyToken(token);

  if (!decoded) {
    throw new HttpError(401, 'Invalid or expired token');
  }

  req.userId = decoded.userId;
  next();
}
