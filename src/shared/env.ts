import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL falta"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL falta"),
  STORAGE_PROVIDER: z.enum(["supabase", "filesystem"]).default("filesystem"),
  STORAGE_LOCAL_DIR: z.string().default("./storage"),
  STORAGE_URL_SECRET: z.string().min(32, "STORAGE_URL_SECRET debe tener min 32 chars"),
  FILE_URL_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET falta"),
});

export const env = envSchema.parse(process.env);
export type AppEnv = z.infer<typeof envSchema>;
