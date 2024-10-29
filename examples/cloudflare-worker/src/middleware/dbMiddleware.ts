import { createMiddleware } from 'hono/factory';
import { initDB } from '../db/initDB.js';
import { HonoEnv } from '../types/hono.js';

export const dbMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const { db } = await initDB({
    databaseUrl: c.env.DATABASE_URL,
  });

  c.set('db', db);

  await next();
});
