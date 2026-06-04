import { PrismaClient } from '@prisma/client';

// ── Singleton Prisma Client ──────────────────────────────────────────
// One shared connection pool for the whole app.
// Every file imports from here instead of creating its own PrismaClient.
const prisma = new PrismaClient();

export default prisma;
