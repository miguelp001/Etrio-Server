import { Hono } from 'hono';
import { getPrisma } from './db';
import { 
  CharacterService, 
  MarketService,
  UserService
} from './services';

import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all origins
app.use('*', cors());

app.get('/health', (c) => {
  return c.json({ status: 'OK', message: 'Legacy of Etrio Server is running on Cloudflare D1' });
});

app.get('/players', async (c) => {
  const prisma = getPrisma(c.env.DB);
  const players = await prisma.user.findMany();
  return c.json(players);
});

app.post('/sell', async (c) => {
  const prisma = getPrisma(c.env.DB);
  const marketService = new MarketService(prisma);
  return c.json({ status: 'Market route active' });
});

app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

export default app;
