// Prisma Client instance with PostgreSQL adapter
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://placeholder_user:placeholder_pass@localhost:5432/placeholder_db";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString,
});

export const prisma =
  (globalForPrisma.prisma && "passwordResetOtp" in globalForPrisma.prisma)
    ? globalForPrisma.prisma
    : new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
