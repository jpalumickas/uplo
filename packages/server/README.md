# @uplo/server

Framework-agnostic core for [Uplo](https://uplo.js.org) — handle file uploads to S3, Google Cloud Storage and more, with ORM adapter support.

If you're on Node.js, prefer [`@uplo/node`](https://www.npmjs.com/package/@uplo/node), which re-exports this package with Node-specific helpers.

## Installation

```sh
npm i @uplo/server
```

## Usage

```ts
import { createUplo } from '@uplo/server'
import { createPrismaAdapter } from '@uplo/adapter-prisma'
import { createS3Service } from '@uplo/service-s3'

const uplo = createUplo({
  config: {
    privateKey: process.env.APPLICATION_SECRET,
    signedIdExpiresIn: 60 * 60,
  },
  adapter: createPrismaAdapter({ prisma }),
  services: {
    s3: createS3Service({
      isPublic: false,
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_BUCKET,
      accessKeyId: '*****',
      secretAccessKey: '*****',
    }),
  },
  attachments: {},
})
```

## Route handler

A framework-agnostic `fetch` handler is exported from `@uplo/server/route-handler`. It works with Hono, Cloudflare Workers, Bun and Deno.

```ts
import { createUploRouteHandler } from '@uplo/server/route-handler'

const handler = createUploRouteHandler({ uplo, basePath: '/uplo' })
```

## Documentation

See the full docs at [uplo.js.org](https://uplo.js.org).
