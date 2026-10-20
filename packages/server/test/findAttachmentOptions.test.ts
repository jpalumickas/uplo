import { describe, it, expect } from 'vitest'

import type { Adapter, Service } from '@uplo/types'

import { AttachmentNotFoundError, createUplo } from '../src'
import { findAttachmentOptions } from '../src/lib/findAttachmentOptions'

const attachments = {
  user: {
    avatar: { validate: { contentType: 'image/png', size: { max: 10 } } },
    cover: true as const,
  },
}

describe('findAttachmentOptions', () => {
  it('finds attachment options', () => {
    expect(findAttachmentOptions(attachments, 'user.avatar')).toEqual({
      modelName: 'user',
      attachmentName: 'avatar',
      options: attachments.user.avatar,
    })
    expect(findAttachmentOptions(attachments, 'user.cover')).toEqual({
      modelName: 'user',
      attachmentName: 'cover',
      options: true,
    })
  })

  it.each([
    'user.avatar.validate',
    'user.avatar.validate.size',
    'user.constructor',
    'user.__proto__',
    'constructor.prototype',
    '__proto__.avatar',
    'user.hasOwnProperty',
    'user[avatar]',
    'user',
    'user.',
    '.avatar',
    'post.avatar',
    'user.missing',
    '',
  ])('returns null for "%s"', (name) => {
    expect(findAttachmentOptions(attachments, name)).toBeNull()
  })

  it('returns null for non-string name', () => {
    expect(findAttachmentOptions(attachments, undefined as unknown as string)).toBeNull()
  })
})

describe('$findGenericAttachment', () => {
  const uplo = createUplo({
    services: { test: {} as Service },
    adapter: {} as Adapter,
    config: { privateKey: 'test-private-key-that-is-32-bytes' },
    attachments,
  })

  it('finds defined attachment', () => {
    expect(uplo.$findGenericAttachment('user.avatar')).toBeTruthy()
  })

  it.each(['user.avatar.validate', 'user.constructor', 'constructor.prototype'])(
    'throws for "%s"',
    (name) => {
      expect(() => uplo.$findGenericAttachment(name as `${string}.${string}`)).toThrow(
        AttachmentNotFoundError,
      )
    },
  )
})
