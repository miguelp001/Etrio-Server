import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const app = new Hono();

// For Cloudflare Workers, we typically pass the context (Env)
// We'll define a type for our Env
type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

// Simple Health Check
app.get('/health', (c) => {
  return c.json({ status: 'OK', message: 'Legacy of Etrio Server is running on the Edge' });
});

// Root route
app.get('/', (c) => {
  return c.text('Welcome to the Legacy of Etrio Backend (Cloudflare Edition)');
});

// Error handling
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

export default app;
