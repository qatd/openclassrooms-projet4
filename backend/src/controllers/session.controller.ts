import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { HttpError } from '../errors/http-error';
import { UserRepository } from '../repositories/user.repository';
import { TeacherRepository } from '../repositories/teacher.repository';
import { SessionRepository } from '../repositories/session.repository';
import { ParticipationRepository } from '../repositories/participation.repository';

const userRepository = new UserRepository();
const teacherRepository = new TeacherRepository();
const sessionRepository = new SessionRepository();
const participationRepository = new ParticipationRepository();

export class SessionController {
  async getAll(req: AuthRequest, res: Response) {
    const sessions = await sessionRepository.findAll();

    const response: any = sessions.map((session: any) => ({
      id: session.id,
      name: session.name,
      date: session.date,
      description: session.description,
      teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
      },
      users: session.participants.map((p: any) => p.user.id),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));

    return res.status(200).json(response);
  }

  async getById(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };

    if (!id) {
      throw new HttpError(400, 'Session ID is required');
    }

    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      throw new HttpError(400, 'Invalid session ID');
    }

    const session = await sessionRepository.findByIdWithDetails(sessionId);

    if (!session) {
      throw new HttpError(404, 'Session not found');
    }

    const response: any = {
      id: session.id,
      name: session.name,
      date: session.date,
      description: session.description,
      teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
      },
      users: session.participants.map((p: any) => p.user.id),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };

    return res.status(200).json(response);
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

    // Always set by authMiddleware: this check lets TypeScript know it's a number
    if (!req.userId) {
      throw new HttpError(401, 'Unauthorized');
    }

    const user = await userRepository.findById(req.userId);

    if (!user || !user.admin) {
      throw new HttpError(403, 'Admin access required');
    }

    const teacher = await teacherRepository.findById(teacherId);

    if (!teacher) {
      throw new HttpError(404, 'Teacher not found');
    }

    const session = await sessionRepository.create({
      name,
      date: new Date(date),
      description,
      teacherId,
    });

    const response: any = {
      id: session.id,
      name: session.name,
      date: session.date,
      description: session.description,
      teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
      },
      users: [],
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };

    return res.status(201).json(response);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };
    const { name, date, description, teacherId } = req.body;

    if (!id) {
      throw new HttpError(400, 'Session ID is required');
    }

    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      throw new HttpError(400, 'Invalid session ID');
    }

    // Always set by authMiddleware: this check lets TypeScript know it's a number
    if (!req.userId) {
      throw new HttpError(401, 'Unauthorized');
    }

    const user = await userRepository.findById(req.userId);

    if (!user || !user.admin) {
      throw new HttpError(403, 'Admin access required');
    }

    const existingSession = await sessionRepository.findById(sessionId);

    if (!existingSession) {
      throw new HttpError(404, 'Session not found');
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (date) updateData.date = new Date(date);
    if (description) updateData.description = description;
    if (teacherId) {
      const teacher = await teacherRepository.findById(teacherId);
      if (!teacher) {
        throw new HttpError(404, 'Teacher not found');
      }
      updateData.teacherId = teacherId;
    }

    const session = await sessionRepository.update(sessionId, updateData);

    const response: any = {
      id: session.id,
      name: session.name,
      date: session.date,
      description: session.description,
      teacher: {
        id: session.teacher.id,
        firstName: session.teacher.firstName,
        lastName: session.teacher.lastName,
      },
      users: session.participants.map((p: any) => p.user.id),
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };

    return res.status(200).json(response);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params as { id: string };

    if (!id) {
      throw new HttpError(400, 'Session ID is required');
    }

    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      throw new HttpError(400, 'Invalid session ID');
    }

    // Always set by authMiddleware: this check lets TypeScript know it's a number
    if (!req.userId) {
      throw new HttpError(401, 'Unauthorized');
    }

    const user = await userRepository.findById(req.userId);

    if (!user || !user.admin) {
      throw new HttpError(403, 'Admin access required');
    }

    const existingSession = await sessionRepository.findById(sessionId);

    if (!existingSession) {
      throw new HttpError(404, 'Session not found');
    }

    await sessionRepository.delete(sessionId);

    return res.status(200).json({ message: 'Session deleted successfully' });
  }

  async participate(req: AuthRequest, res: Response) {
    const { id, userId } = req.params as { id: string, userId: string };

    if (!id) {
      throw new HttpError(400, 'Session ID is required');
    }
    if (!userId) {
      throw new HttpError(400, 'User ID is required');
    }

    const sessionId = parseInt(id);
    const participantUserId = parseInt(userId);

    if (isNaN(sessionId)) {
      throw new HttpError(400, 'Invalid session ID');
    }
    if (isNaN(participantUserId)) {
      throw new HttpError(400, 'Invalid user ID');
    }

    const session = await sessionRepository.findById(sessionId);

    if (!session) {
      throw new HttpError(404, 'Session not found');
    }

    const user = await userRepository.findById(participantUserId);

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    const existingParticipation = await participationRepository.find(sessionId, participantUserId);

    if (existingParticipation) {
      throw new HttpError(400, 'User already participating in this session');
    }

    await participationRepository.create(sessionId, participantUserId);

    return res.status(200).json({ message: 'Successfully joined the session' });
  }

  async unparticipate(req: AuthRequest, res: Response) {
    const { id, userId } = req.params as { id: string, userId: string };

    if (!id) {
      throw new HttpError(400, 'Session ID is required');
    }
    if (!userId) {
      throw new HttpError(400, 'User ID is required');
    }

    const sessionId = parseInt(id);
    const participantUserId = parseInt(userId);

    if (isNaN(sessionId)) {
      throw new HttpError(400, 'Invalid session ID');
    }
    if (isNaN(participantUserId)) {
      throw new HttpError(400, 'Invalid user ID');
    }

    const participation = await participationRepository.find(sessionId, participantUserId);

    if (!participation) {
      throw new HttpError(404, 'Participation not found');
    }

    await participationRepository.delete(sessionId, participantUserId);

    return res.status(200).json({ message: 'Successfully left the session' });
  }
}
