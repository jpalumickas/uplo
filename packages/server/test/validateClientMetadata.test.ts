import { describe, it, expect } from 'vitest'

import { BlobValidationError } from '../src'
import { validateClientMetadata } from '../src/utils/validateClientMetadata'

const keys = (count: number) =>
  Object.fromEntries(Array.from({ length: count }, (_, i) => [`k${i}`, i]))

describe('validateClientMetadata', () => {
  it('returns flat string, number and boolean values', () => {
    expect(validateClientMetadata({ width: 100, caption: 'Hi', public: true })).toEqual({
      width: 100,
      caption: 'Hi',
      public: true,
    })
  })

  it.each([undefined, null, {}])('returns undefined for %j', (metadata) => {
    expect(validateClientMetadata(metadata)).toBeUndefined()
  })

  it.each([
    ['array', [1, 2]],
    ['string', 'hello'],
    ['number', 1],
    ['class instance', new Date()],
  ])('throws for %s', (_name, metadata) => {
    expect(() => validateClientMetadata(metadata)).toThrow(BlobValidationError)
  })

  it.each([
    ['nested object', { a: { b: 1 } }],
    ['array value', { tags: ['a'] }],
    ['null value', { a: null }],
    ['NaN', { a: Number.NaN }],
    ['Infinity', { a: Number.POSITIVE_INFINITY }],
    ['long string', { a: 'x'.repeat(1001) }],
  ])('throws for %s', (_name, metadata) => {
    expect(() => validateClientMetadata(metadata)).toThrow(BlobValidationError)
  })

  it.each(['__proto__', 'constructor.x', '1abc', '', 'a b', 'a'.repeat(65)])(
    'throws for key "%s"',
    (key) => {
      // JSON.parse keeps "__proto__" as a normal key, like a request body would
      const metadata = JSON.parse(JSON.stringify({ [key]: 1 }))
      expect(() => validateClientMetadata(metadata)).toThrow(BlobValidationError)
    },
  )

  it('allows up to 20 keys', () => {
    expect(validateClientMetadata(keys(20))).toBeDefined()
    expect(() => validateClientMetadata(keys(21))).toThrow(/at most 20 keys/)
  })
})
