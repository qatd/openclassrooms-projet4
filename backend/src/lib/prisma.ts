import { PrismaClient } from '@prisma/client';

// Single Prisma client shared by every repository (one connection pool for the whole app)
export const prisma = new PrismaClient();
