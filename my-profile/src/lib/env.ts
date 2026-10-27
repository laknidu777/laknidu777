import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  HOSTNAME: z.string().default("0.0.0.0"),
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required. Provide a valid PostgreSQL connection string."),
  AUTH_SECRET: z
    .string()
    .min(16, "AUTH_SECRET is required and must be at least 16 characters for cryptographic safety."),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL (e.g., https://example.com)").optional(),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_SECURE: z.string().default("true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * Validate application environment variables.
 * Ensures critical configurations are set without logging sensitive secrets.
 */
export function validateEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    const message = `\n========================================\n[CONFIG ERROR] Invalid environment configuration:\n${formattedErrors}\n========================================\n`;

    // Only throw in production or test runtime, log warning in dev
    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    } else {
      console.warn(message);
    }

    // Return partial fallback for local dev resilience
    return {
      NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) || "development",
      PORT: Number(process.env.PORT) || 3000,
      HOSTNAME: process.env.HOSTNAME || "0.0.0.0",
      DATABASE_URL: process.env.DATABASE_URL || "",
      AUTH_SECRET: process.env.AUTH_SECRET || "dev-fallback-secret-minimum-32-chars-long!",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
      SMTP_PORT: Number(process.env.SMTP_PORT) || 465,
      SMTP_SECURE: process.env.SMTP_SECURE || "true",
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      SMTP_FROM: process.env.SMTP_FROM,
    };
  }

  cachedEnv = result.data;
  return cachedEnv;
}
