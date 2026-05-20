import { createMiddleware } from 'hono/factory'

import { createUplo } from '../services/uplo.js'
import type { HonoEnv } from '../types/hono.js'

export const uploMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const uplo = createUplo(c)

  c.set('uplo', uplo)
  await next()
})
