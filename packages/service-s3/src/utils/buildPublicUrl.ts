import type { S3ClientConfig } from '@aws-sdk/client-s3'

import { DEFAULT_REGION } from '../constants'
import { encodeKey } from './encodeKey'

type Params = {
  key: string
  bucket: string
  region: S3ClientConfig['region']
  endpoint?: S3ClientConfig['endpoint']
  /** Base URL for public objects (e.g. CDN or custom domain) */
  publicBaseUrl?: string
}

/** Public URL of an object: CDN or custom domain, custom endpoint, or AWS bucket URL. */
export const buildPublicUrl = ({ key, bucket, region, endpoint, publicBaseUrl }: Params) => {
  const path = encodeKey(key)

  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/+$/, '')}/${path}`
  } else if (endpoint) {
    return `${endpoint}/${bucket}/${path}`
  } else {
    return `https://${bucket}.s3${region === DEFAULT_REGION ? '' : `.${region}`}.amazonaws.com/${path}`
  }
}
