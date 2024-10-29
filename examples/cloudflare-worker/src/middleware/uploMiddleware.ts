import { createMiddleware } from 'hono/factory';
import { HonoEnv } from '../types/hono.js';
import { createUplo } from '../services/uplo.js';

export const uploMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const uplo = createUplo(c);

  c.set('uplo', uplo);
  await next();
});
