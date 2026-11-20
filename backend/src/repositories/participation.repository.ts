import { prisma } from '../lib/prisma';

// Data access for session participations (a user joining a session)
export class ParticipationRepository {
  find(sessionId: number, userId: number) {
    return prisma.sessionParticipation.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
  }

  create(sessionId: number, userId: number) {
    return prisma.sessionParticipation.create({ data: { sessionId, userId } });
  }

  delete(sessionId: number, userId: number) {
    return prisma.sessionParticipation.delete({
      where: { sessionId_userId: { sessionId, userId } },
    });
  }
}
