import type { UploRequestOptions } from '../types'

export const resolveRequestOptions = async ({ headers, credentials }: UploRequestOptions) => {
  const extraHeaders = typeof headers === 'function' ? await headers() : headers

  // The request is always JSON, so a custom Content-Type (in any case) is dropped
  const safeHeaders = Object.fromEntries(
    Object.entries(extraHeaders ?? {}).filter(([name]) => name.toLowerCase() !== 'content-type'),
  )

  return {
    headers: { ...safeHeaders, 'Content-Type': 'application/json' },
    credentials,
  }
}
