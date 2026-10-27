
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const rl = createInterface({ input: stdin, output: stdout });

async function main() {
  const defaultName = process.env.ADMIN_NAME || "Laknidu Thilakawardhana";
  const defaultEmail = (process.env.ADMIN_EMAIL || "laknidut@gmail.com").toLowerCase();
  const envPassword = process.env.ADMIN_PASSWORD;

  let name = defaultName;
  let email = defaultEmail;
  let password = envPassword || "";

  if (!envPassword) {
    const inputName = (await rl.question(`Admin name [${defaultName}]: `)).trim();
    if (inputName) name = inputName;

    const inputEmail = (await rl.question(`Admin email [${defaultEmail}]: `)).trim().toLowerCase();
    if (inputEmail) email = inputEmail;

    password = await rl.question("Admin password (12-72 characters): ");
  } else {
    console.log(`Using ADMIN_PASSWORD from environment for ${defaultEmail}...`);
  }

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a name and a valid email address.");
  }

  if (password.length < 12 || password.length > 72) {
    throw new Error("Use a password between 12 and 72 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "ADMIN" },
    create: { name, email, passwordHash, role: "ADMIN" },
    select: { id: true, name: true, email: true, role: true },
  });

  console.log("Admin account ready:", user);
}

main()
  .catch((error) => {
    console.error("Could not create admin:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
