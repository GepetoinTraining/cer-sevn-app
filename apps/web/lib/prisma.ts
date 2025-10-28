// apps/web/app/lib/prisma.ts
import { PrismaClient, ItemStatus } from '@prisma/client'; // <-- Import ItemStatus here

// PrismaClient is attached to the `global` object in development
// to prevent exhausting your database connection limit.
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Re-export the enum so other files can import it from here
export { ItemStatus };

