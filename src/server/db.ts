import { PrismaClient } from "@prisma/client";
import path from "path";

let prisma: PrismaClient;
// Keep the app usable immediately after cloning. Production deployments can
// still override this with DATABASE_URL.
const databaseUrl = process.env.DATABASE_URL || `file:${path.resolve(process.cwd(), "prisma", "dev.db").replace(/\\/g, "/")}`;

declare global {
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  }
  prisma = global.__prisma;
}

export default prisma;
