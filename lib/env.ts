import { z } from "zod";

const envSchema = z.object({
  OPENMETADATA_HOST: z.string().url(),
  OPENMETADATA_TOKEN: z.string().min(1),
});

type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const key = parsed.error.issues[0]?.path[0] ?? "OPENMETADATA_HOST";
    throw new Error(`Missing required env var: ${String(key)}`);
  }

  return parsed.data;
}

let cachedEnv: Env | null = null;

function getEnv(source: NodeJS.ProcessEnv = process.env): Env {
  if (source !== process.env) {
    return loadEnv(source);
  }

  if (!cachedEnv) {
    cachedEnv = loadEnv(source);
  }

  return cachedEnv;
}

// Keep env access lazy so tests can import loadEnv without real credentials.
export const env = {
  get OPENMETADATA_HOST() {
    return getEnv().OPENMETADATA_HOST;
  },
  get OPENMETADATA_TOKEN() {
    return getEnv().OPENMETADATA_TOKEN;
  },
};
