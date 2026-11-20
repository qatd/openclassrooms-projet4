import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

// Relations loaded when a session is returned to the client (teacher + participants)
const sessionDetails = {
  teacher: true,
  participants: { include: { user: true } },
} satisfies Prisma.SessionInclude;

// Type of a session loaded with these relations
export type SessionWithDetails = Prisma.SessionGetPayload<{ include: typeof sessionDetails }>;

// Data access for sessions: the only place that queries the `sessions` table
export class SessionRepository {
  findAll() {
    return prisma.session.findMany({ include: sessionDetails });
  }

  // Session alone, used to check that it exists
  findById(id: number) {
    return prisma.session.findUnique({ where: { id } });
  }

  // Session with its teacher and participants, used to build the response
  findByIdWithDetails(id: number) {
    return prisma.session.findUnique({ where: { id }, include: sessionDetails });
  }

  create(data: Prisma.SessionUncheckedCreateInput) {
    return prisma.session.create({ data, include: sessionDetails });
  }

  update(id: number, data: Prisma.SessionUncheckedUpdateInput) {
    return prisma.session.update({ where: { id }, data, include: sessionDetails });
  }

  delete(id: number) {
    return prisma.session.delete({ where: { id } });
  }
}
