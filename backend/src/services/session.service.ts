import { Prisma } from '@prisma/client';
import { CreateSessionDto, UpdateSessionDto } from '../dto/session.dto';
import { HttpError } from '../errors/http-error';
import { ParticipationRepository } from '../repositories/participation.repository';
import { SessionRepository, SessionWithDetails } from '../repositories/session.repository';
import { TeacherRepository } from '../repositories/teacher.repository';
import { UserRepository } from '../repositories/user.repository';

const sessionRepository = new SessionRepository();
const teacherRepository = new TeacherRepository();
const userRepository = new UserRepository();
const participationRepository = new ParticipationRepository();

// Response sent to the client: teacher's name and ids of the participants
const toSessionResponse = (session: SessionWithDetails) => ({
  id: session.id,
  name: session.name,
  date: session.date,
  description: session.description,
  teacher: {
    id: session.teacher.id,
    firstName: session.teacher.firstName,
    lastName: session.teacher.lastName,
  },
  users: session.participants.map((participant) => participant.user.id),
  createdAt: session.createdAt,
  updatedAt: session.updatedAt,
});

// Business rules for sessions: admin rights, existence checks, participations
export class SessionService {
  async findAll() {
    const sessions = await sessionRepository.findAll();
    return sessions.map(toSessionResponse);
  }

  async findById(id: number) {
    const session = await sessionRepository.findByIdWithDetails(id);

    if (!session) {
      throw new HttpError(404, 'Session not found');
    }

    return toSessionResponse(session);
  }

  async create(currentUserId: number | undefined, data: CreateSessionDto) {
    await this.ensureAdmin(currentUserId);
    await this.ensureTeacherExists(data.teacherId);

    const session = await sessionRepository.create({
      name: data.name,
      date: new Date(data.date),
      description: data.description,
      teacherId: data.teacherId,
    });

    return toSessionResponse(session);
  }

  async update(currentUserId: number | undefined, id: number, data: UpdateSessionDto) {
    await this.ensureAdmin(currentUserId);
    await this.ensureSessionExists(id);

    // Only the fields sent by the client are updated
    const updateData: Prisma.SessionUncheckedUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.date) updateData.date = new Date(data.date);
    if (data.description) updateData.description = data.description;
    if (data.teacherId) {
      await this.ensureTeacherExists(data.teacherId);
      updateData.teacherId = data.teacherId;
    }

    const session = await sessionRepository.update(id, updateData);
    return toSessionResponse(session);
  }

  async delete(currentUserId: number | undefined, id: number) {
    await this.ensureAdmin(currentUserId);
    await this.ensureSessionExists(id);
    await sessionRepository.delete(id);
  }

  async participate(currentUserId: number | undefined, sessionId: number, userId: number) {
    this.ensureSameUser(currentUserId, userId);
    await this.ensureSessionExists(sessionId);

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    const existingParticipation = await participationRepository.find(sessionId, userId);

    if (existingParticipation) {
      throw new HttpError(400, 'User already participating in this session');
    }

    await participationRepository.create(sessionId, userId);
  }

  async unparticipate(currentUserId: number | undefined, sessionId: number, userId: number) {
    this.ensureSameUser(currentUserId, userId);

    const participation = await participationRepository.find(sessionId, userId);

    if (!participation) {
      throw new HttpError(404, 'Participation not found');
    }

    await participationRepository.delete(sessionId, userId);
  }

  // A user can only join or leave a session for themselves, not for someone else
  private ensureSameUser(currentUserId: number | undefined, userId: number) {
    if (currentUserId !== userId) {
      throw new HttpError(403, 'You can only join or leave a session for yourself');
    }
  }

  // Only admins can create, update or delete sessions
  private async ensureAdmin(currentUserId: number | undefined) {
    // Always set by authMiddleware: this check lets TypeScript know it's a number
    if (!currentUserId) {
      throw new HttpError(401, 'Unauthorized');
    }

    const user = await userRepository.findById(currentUserId);

    if (!user?.admin) {
      throw new HttpError(403, 'Admin access required');
    }
  }

  private async ensureSessionExists(id: number) {
    const session = await sessionRepository.findById(id);

    if (!session) {
      throw new HttpError(404, 'Session not found');
    }
  }

  private async ensureTeacherExists(id: number) {
    const teacher = await teacherRepository.findById(id);

    if (!teacher) {
      throw new HttpError(404, 'Teacher not found');
    }
  }
}
