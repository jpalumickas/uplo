import type { Hono as H, Context } from 'hono';
import type { initDB } from '../db/initDB.js';
import type { createUplo } from '../services/uplo.js';

export type HonoBindings = {
  DATABASE_URL: string;
  UPLO_SECRET_TOKEN: string;

  AWS_BUCKET: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_ENDPOINT: string;
};

export type HonoVariables = {
  db: Awaited<ReturnType<typeof initDB>>['db'];
  uplo: Awaited<ReturnType<typeof createUplo>>;
};

export type HonoEnv = {
  Bindings: HonoBindings;
  Variables: HonoVariables;
};

export type Hono = H<HonoEnv>;
export type HonoContext = Context<HonoEnv>;
