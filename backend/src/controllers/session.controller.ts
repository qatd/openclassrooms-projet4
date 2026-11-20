import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { HttpError } from '../errors/http-error';
import { SessionService } from '../services/session.service';
import { parseId } from '../utils/parse-id';

const sessionService = new SessionService();

export class SessionController {
  async getAll(req: AuthRequest, res: Response) {
    const sessions = await sessionService.findAll();

    return res.status(200).json(sessions);
  }

  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };

    const session = await sessionService.findById(parseId(id, 'Session'));

    return res.status(200).json(session);
  }

  async create(req: AuthRequest, res: Response) {
    const { name, date, description, teacherId } = req.body;

    if (!name) {
      throw new HttpError(400, 'Name is required');
    }
    if (!date) {
      throw new HttpError(400, 'Date is required');
    }
    if (!description) {
      throw new HttpError(400, 'Description is required');
    }
    if (!teacherId) {
      throw new HttpError(400, 'Teacher ID is required');
    }

    const session = await sessionService.create(req.userId, { name, date, description, teacherId });

    return res.status(201).json(session);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    const { name, date, description, teacherId } = req.body;

    const session = await sessionService.update(req.userId, parseId(id, 'Session'), {
      name,
      date,
      description,
      teacherId,
    });

    return res.status(200).json(session);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };

    await sessionService.delete(req.userId, parseId(id, 'Session'));

    return res.status(200).json({ message: 'Session deleted successfully' });
  }

  async participate(req: AuthRequest, res: Response) {
    const { id, userId } = req.params as { id: string, userId: string };

    await sessionService.participate(parseId(id, 'Session'), parseId(userId, 'User'));

    return res.status(200).json({ message: 'Successfully joined the session' });
  }

  async unparticipate(req: AuthRequest, res: Response) {
    const { id, userId } = req.params as { id: string, userId: string };

    await sessionService.unparticipate(parseId(id, 'Session'), parseId(userId, 'User'));

    return res.status(200).json({ message: 'Successfully left the session' });
  }
}
