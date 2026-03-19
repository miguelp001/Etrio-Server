import { getPrisma } from '../db';

export class UserService {
  constructor(private prisma: any) {}

  async createUser(username: string, email: string) {
    return this.prisma.user.create({
      data: {
        username,
        email,
        password: 'placeholder_password', // In a real app, hash this
        gold: 100,
      },
    });
  }

  async getUser(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        characters: true,
        guild: true,
      },
    });
  }

  async addGold(id: string, amount: number) {
    return this.prisma.user.update({
      where: { id },
      data: {
        gold: { increment: amount },
      },
    });
  }

  async removeGold(id: string, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.gold < amount) throw new Error('Insufficient gold');

    return this.prisma.user.update({
      where: { id },
      data: {
        gold: { decrement: amount },
      },
    });
  }
}
