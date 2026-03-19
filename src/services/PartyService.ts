import { getPrisma } from '../db';

export class PartyService {
  private prisma;

  constructor(databaseUrl: string) {
    this.prisma = getPrisma(databaseUrl);
  }

  async createParty(characterIds: string[]) {
    return this.prisma.party.create({
      data: {
        members: {
          connect: characterIds.map(id => ({ id })),
        },
        lastFloor: 1,
      },
      include: {
        members: true,
      },
    });
  }

  async getPartyByCharacter(characterId: string) {
    return this.prisma.party.findFirst({
      where: {
        members: {
          some: { id: characterId },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async updateAffinity(charAId: string, charBId: string, points: number) {
    // Sort IDs to ensure consistency in the unique composite key
    const [id1, id2] = [charAId, charBId].sort();
    
    return this.prisma.affinity.upsert({
      where: {
        charAId_charBId: {
          charAId: id1,
          charBId: id2,
        },
      },
      update: {
        score: { increment: points },
      },
      create: {
        charAId: id1,
        charBId: id2,
        score: points,
      },
    });
  }
}
