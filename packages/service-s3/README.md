# @uplo/service-s3

S3-compatible storage service for [Uplo](https://uplo.js.org). Works with AWS S3, DigitalOcean Spaces, MinIO, and other S3-compatible providers. For Cloudflare R2 use [`@uplo/service-r2`](https://uplo.js.org/services/cloudflare-r2).

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
- `publicUrl`: Base URL for public files (e.g. CDN or custom domain). Defaults to the bucket URL.
- `acl = true`: Send object ACL on uploads. Set `false` for providers without ACL support.
- `requestChecksumCalculation = 'WHEN_REQUIRED'`, `responseChecksumValidation = 'WHEN_REQUIRED'`: Passed to the AWS SDK client. The SDK default (`WHEN_SUPPORTED`) breaks direct uploads.

## Documentation

- [AWS S3](https://uplo.js.org/services/s3)
- [Cloudflare R2](https://uplo.js.org/services/cloudflare-r2)
- [DigitalOcean Spaces](https://uplo.js.org/services/digitalocean)
- [MinIO](https://uplo.js.org/services/minio)
