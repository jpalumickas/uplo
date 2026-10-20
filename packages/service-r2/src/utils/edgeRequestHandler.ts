import type { S3ServiceOptions } from '@uplo/service-s3'

// Workers' fetch rejects the `cache` option the AWS SDK sets
export const edgeRequestHandler = {
  requestInit(_httpRequest: unknown) {
    return { cache: undefined }
  },
} as S3ServiceOptions['requestHandler']
