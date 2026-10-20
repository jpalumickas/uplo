import type { ClientMetadata } from '@uplo/types'

import { BlobValidationError } from '../errors'

export const CLIENT_METADATA_LIMITS = {
  maxKeys: 20,
  maxKeyLength: 64,
  maxStringLength: 1000,
}

// Must start with a letter, so keys like `__proto__` are refused
const KEY_PATTERN = new RegExp(
  `^[a-zA-Z][a-zA-Z0-9_-]{0,${CLIENT_METADATA_LIMITS.maxKeyLength - 1}}$`,
)

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype

const isValidValue = (value: unknown) =>
  typeof value === 'boolean' ||
  (typeof value === 'number' && Number.isFinite(value)) ||
  (typeof value === 'string' && value.length <= CLIENT_METADATA_LIMITS.maxStringLength)

/**
 * Checks metadata sent by the client and returns a clean copy. Only a flat
 * object with string, number or boolean values is accepted.
 */
export const validateClientMetadata = (metadata: unknown): ClientMetadata | undefined => {
  if (metadata === undefined || metadata === null) {
    return undefined
  }

  if (!isPlainObject(metadata)) {
    throw new BlobValidationError('Metadata must be an object')
  }

  const entries = Object.entries(metadata)

  if (entries.length > CLIENT_METADATA_LIMITS.maxKeys) {
    throw new BlobValidationError(
      `Metadata can have at most ${CLIENT_METADATA_LIMITS.maxKeys} keys`,
    )
  }

  for (const [key, value] of entries) {
    if (!KEY_PATTERN.test(key)) {
      throw new BlobValidationError(`Invalid metadata key "${key}"`)
    }

    if (!isValidValue(value)) {
      throw new BlobValidationError(
        `Metadata "${key}" must be a string (up to ${CLIENT_METADATA_LIMITS.maxStringLength} characters), number or boolean`,
      )
    }
  }

  return entries.length > 0 ? (Object.fromEntries(entries) as ClientMetadata) : undefined
}
