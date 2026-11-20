import { prisma } from '../lib/prisma';

// Data access for teachers: the only place that queries the `teachers` table
export class TeacherRepository {
  findAll() {
    return prisma.teacher.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findById(id: number) {
    return prisma.teacher.findUnique({ where: { id } });
  }
}
