import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

// Data access for users: the only place that queries the `users` table
export class UserRepository {
  findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  update(id: number, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.user.delete({ where: { id } });
  }
}
