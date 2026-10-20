import { createDrizzleAdapter } from '@uplo/adapter-drizzle-pg'
import { createUplo as createUploServer } from '@uplo/server'
import { createR2Service } from '@uplo/service-r2'

import * as schema from '../db/schema.js'
import type { HonoContext } from '../types/hono.js'

export const createUplo = (c: HonoContext) => {
  const db = c.get('db')

  const r2Service = createR2Service({
    accountId: c.env.R2_ACCOUNT_ID,
    bucket: c.env.R2_BUCKET,
    accessKeyId: c.env.R2_ACCESS_KEY_ID,
    secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
  })

  const uplo = createUploServer({
    config: {
      privateKey: c.env.UPLO_SECRET_TOKEN,
    },
    adapter: createDrizzleAdapter({
      db,
      schema,
    }),
    services: {
      r2: r2Service,
    },
    attachments: {
      user: {
        avatar: {
          directUpload: true,
          validate: {
            // contentType: ['image/png', 'image/jpeg'],
            contentType: /image\/\w/,
            size: {
              max: 1024 * 1024 * 5, // 5MB
            },
          },
        },
      },
    },
  })

  uplo.attachments.user(123)

  return uplo
}
