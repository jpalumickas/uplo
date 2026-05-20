# @uplo/node

Node.js entry point for [Uplo](https://uplo.js.org) — handle file uploads to S3, Google Cloud Storage and more, with ORM adapter support.

## Installation

```sh
npm i @uplo/node
```

## Usage

```ts
import { createUplo } from '@uplo/node'
import { createPrismaAdapter } from '@uplo/adapter-prisma'
import { createS3Service } from '@uplo/service-s3'

const config = {
  privateKey: process.env.APPLICATION_SECRET, // Used to sign direct upload keys
  signedIdExpiresIn: 60 * 60, // Time how long a Signed ID is valid
}

const uplo = createUplo({
  config,
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

## Blob inputs

Node-specific helpers for attaching files:

```ts
import { blobFileInput, blobStringInput, blobBufferInput } from '@uplo/node'

const fileInput = await blobFileInput({ path: '/home/images/image.png' })
await uplo.attachments.user(123).avatar.attachFile(fileInput)
```

## Documentation

See the full docs at [uplo.js.org](https://uplo.js.org).
