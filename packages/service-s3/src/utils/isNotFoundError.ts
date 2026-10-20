// S3 returns 404 for a missing object only when the credentials can list the
// bucket (`s3:ListBucket`), otherwise 403, which is not treated as missing
export const isNotFoundError = (err: unknown) => {
  const error = err as { name?: string; $metadata?: { httpStatusCode?: number } }
  return error?.name === 'NotFound' || error?.$metadata?.httpStatusCode === 404
}
