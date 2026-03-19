import { Hono } from 'hono';
import { getPrisma } from './db';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Simple Health Check
app.get('/health', (c) => {
  return c.json({ status: 'OK', message: 'Legacy of Etrio Server is running on Cloudflare D1' });
});

// Example route using D1
app.get('/players', async (c) => {
  const prisma = getPrisma(c.env.DB);
  const players = await prisma.user.findMany();
  return c.json(players);
});

// Error handling
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

export default app;
