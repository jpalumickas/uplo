import { describe, it, expect } from 'vitest'

import type { BlobStoragePath, BlobStoragePathParams, Service } from '@uplo/types'

import { UploError } from '../src/errors'
import { buildBlobKey, getFileExtension } from '../src/lib/buildBlobKey'

const params = {
  serviceName: 's3',
  modelName: 'user',
  attachmentName: 'avatar',
  fileName: 'Photo.JPG',
  contentType: 'image/jpeg',
}

const serviceWith = (storagePath?: BlobStoragePath) => ({ storagePath }) as Service

describe('getFileExtension', () => {
  it('returns lowercase extension from file name', () => {
    expect(getFileExtension({ fileName: 'archive.tar.GZ', contentType: '' })).toEqual('gz')
  })

  it('falls back to content type', () => {
    expect(getFileExtension({ fileName: 'photo', contentType: 'image/png' })).toEqual('png')
    expect(getFileExtension({ fileName: '.env', contentType: 'image/png' })).toEqual('png')
  })

  it('returns undefined when nothing matches', () => {
    expect(getFileExtension({ fileName: 'file', contentType: 'unknown/type' })).toBeUndefined()
  })
})

describe('buildBlobKey', () => {
  it('returns random key when no storagePath is set', async () => {
    const key = await buildBlobKey({ service: serviceWith(), ...params })

    expect(key).toMatch(/^[0-9a-f]{64}$/)
  })

  it('uses service storagePath', async () => {
    let received: BlobStoragePathParams | undefined
    const key = await buildBlobKey({
      service: serviceWith(async (p) => {
        received = p
        return `/${p.modelName}/${p.attachmentName}/${p.key}.${p.extension}`
      }),
      ...params,
    })

    expect(received).toMatchObject({ ...params, extension: 'jpg' })
    expect(received?.key).toMatch(/^[0-9a-f]{64}$/)
    expect(key).toEqual(`user/avatar/${received?.key}.jpg`)
  })

  it('prefers attachment storagePath over service storagePath', async () => {
    const key = await buildBlobKey({
      service: serviceWith(() => 'service/file'),
      storagePath: ({ extension }) => `attachment/file.${extension}`,
      ...params,
    })

    expect(key).toEqual('attachment/file.jpg')
  })

  it('throws when storagePath returns empty string', async () => {
    await expect(buildBlobKey({ service: serviceWith(() => '/'), ...params })).rejects.toThrow(
      UploError,
    )
  })
})
