import type { Hono as H, Context } from 'hono'

import type { initDB } from '../db/initDB.js'
import type { createUplo } from '../services/uplo.js'

export type HonoBindings = {
  DATABASE_URL: string
  UPLO_SECRET_TOKEN: string

  R2_ACCOUNT_ID: string
  R2_BUCKET: string
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
}

export type HonoVariables = {
  db: Awaited<ReturnType<typeof initDB>>['db']
  uplo: Awaited<ReturnType<typeof createUplo>>
}

export type HonoEnv = {
  Bindings: HonoBindings
  Variables: HonoVariables
}

export type Hono = H<HonoEnv>
export type HonoContext = Context<HonoEnv>
