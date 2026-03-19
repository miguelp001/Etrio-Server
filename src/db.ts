// @ts-ignore
import { PrismaClient } from '@prisma/client/edge';
import { PrismaD1 } from '@prisma/adapter-d1';

let prisma: any;

export function getPrisma(d1Database: any) {
  if (prisma) return prisma;

  const adapter = new PrismaD1(d1Database);
  // @ts-ignore
  prisma = new PrismaClient({ adapter });
  
  return prisma;
}
