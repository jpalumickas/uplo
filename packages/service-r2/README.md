# @uplo/service-r2

Cloudflare R2 storage service for [Uplo](https://uplo.js.org). Works in Node.js and Cloudflare Workers.

## Installation

```sh
npm i @uplo/service-r2
```

## Usage

```ts
import { createR2Service } from '@uplo/service-r2'

const uplo = createUplo({
  services: {
    r2: createR2Service({
      accountId: process.env.R2_ACCOUNT_ID,
      bucket: process.env.R2_BUCKET,
      accessKeyId: '*****',
      secretAccessKey: '*****',
    }),
  },
})
```

## Options

- `accountId` (**required**): Your Cloudflare account ID.
- `bucket` (**required**): Your bucket name where to store objects.
- `accessKeyId` (**required**): Access Key ID from your R2 API token.
- `secretAccessKey` (**required**): Secret Access Key from your R2 API token.
- `jurisdiction`: `'eu'` or `'fedramp'`, if the bucket was created with a jurisdiction.
- `endpoint`: Full S3 API endpoint. Overrides `accountId` and `jurisdiction`.
- `isPublic = false`: Serve files from a public bucket URL. Requires `publicUrl`.
- `publicUrl`: Public bucket URL (r2.dev subdomain or custom domain).
- `storagePath`: Default path in the bucket for new files.

## Documentation

- [Cloudflare R2](https://uplo.js.org/services/cloudflare-r2)
