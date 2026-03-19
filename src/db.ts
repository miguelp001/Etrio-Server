import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

let prisma: PrismaClient;

export function getPrisma(d1Database: D1Database) {
  if (prisma) return prisma;

  const adapter = new PrismaD1(d1Database);
  prisma = new PrismaClient({ adapter });
  
  return prisma;
}
