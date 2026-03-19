# Database Setup Guide: Cloudflare D1 (Native)

Since "Legacy of Etrio" is built for Cloudflare Workers, using **Cloudflare D1** is the simplest and most integrated way to manage your database.

## 1. Create your D1 Database
Run the following command in your terminal to create a native D1 instance:

```bash
npx wrangler d1 create etrio-db
```

## 2. Configure Wrangler
Copy the `database_id` from the command output and paste it into your `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "etrio-db"
database_id = "PASTE_YOUR_ID_HERE"
```

## 3. Initialize the Schema
To sync your Prisma schema with the D1 database, run:

```bash
# Create the local dev database
npx prisma migrate dev --name init

# Deploy the schema to the live D1 instance
npx wrangler d1 execute etrio-db --file=./prisma/migrations/[TIMESTAMP]_init/migration.sql
```

## 4. Deploy the Server
Since D1 is natively bound to your worker, you do **not** need secret connection strings. Just deploy:

```bash
npx wrangler deploy
```

## 5. Local Development
For local testing, use the Wrangler dev server:
```bash
npm run dev
```
Hono will automatically pick up your local D1 binding.
