# @uplo/service-s3

S3-compatible storage service for [Uplo](https://uplo.js.org). Works with AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO, and other S3-compatible providers.

## Installation

```sh
npm i @uplo/service-s3
```

## Usage

```ts
import { createS3Service } from '@uplo/service-s3'

const uplo = createUplo({
  services: {
    s3: createS3Service({
      isPublic: false,
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_BUCKET,
      accessKeyId: '*****',
      secretAccessKey: '*****',
    }),
  },
})
```

## Options

- `bucket` (**required**): Your bucket name where to store objects.
- `accessKeyId` (**required**): Access Key ID from your service credentials.
- `secretAccessKey` (**required**): Secret Access Key from your service credentials.
- `region = 'us-east-1'`: Your service region.
- `isPublic = false`: Specify a bucket ACL.
- `endpoint`: Custom endpoint for non-AWS S3-compatible providers.
- `forcePathStyle`: Use path-style URLs (required for MinIO, DigitalOcean Spaces).

## Documentation

- [AWS S3](https://uplo.js.org/services/s3)
- [Cloudflare R2](https://uplo.js.org/services/cloudflare-r2)
- [DigitalOcean Spaces](https://uplo.js.org/services/digitalocean)
- [MinIO](https://uplo.js.org/services/minio)
