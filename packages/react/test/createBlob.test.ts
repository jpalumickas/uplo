import { describe, it, expect, vi, afterEach } from 'vitest'

import { createBlob } from '../src/services/createBlob'

const fetchMock = vi.fn<typeof fetch>(async () =>
  Response.json({ signedId: 'signed', upload: { url: 'https://storage.test', headers: {} } }),
)
vi.stubGlobal('fetch', fetchMock)

afterEach(() => {
  fetchMock.mockClear()
})

const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })

const requestInit = () => fetchMock.mock.calls[0][1]!

describe('createBlob request options', () => {
  it('sends only JSON content type by default', async () => {
    await createBlob('user.avatar', { file }, { host: 'https://api.test' })

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/uploads/create-direct-upload')
    expect(requestInit().headers).toEqual({ 'Content-Type': 'application/json' })
    expect(requestInit().credentials).toBeUndefined()
  })

  it('sends extra headers and credentials', async () => {
    await createBlob(
      'user.avatar',
      { file },
      {
        host: 'https://api.test',
        headers: { Authorization: 'Bearer abc' },
        credentials: 'include',
      },
    )

    expect(requestInit().headers).toEqual({
      Authorization: 'Bearer abc',
      'Content-Type': 'application/json',
    })
    expect(requestInit().credentials).toBe('include')
  })

  it('calls headers function before each request', async () => {
    let token = 0
    const headers = vi.fn<() => Promise<Record<string, string>>>(async () => ({
      Authorization: `Bearer ${++token}`,
    }))

    await createBlob('user.avatar', { file }, { host: '', headers })
    await createBlob('user.avatar', { file }, { host: '', headers })

    expect(headers).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][1]!.headers).toMatchObject({ Authorization: 'Bearer 2' })
  })

  it('keeps JSON content type when a custom one is given', async () => {
    await createBlob(
      'user.avatar',
      { file },
      { host: '', headers: { 'content-type': 'text/plain', 'Content-Type': 'text/html' } },
    )

    expect(requestInit().headers).toEqual({ 'Content-Type': 'application/json' })
  })

  it('returns error when headers function throws', async () => {
    const result = await createBlob(
      'user.avatar',
      { file },
      {
        host: '',
        headers: async () => {
          throw new Error('Not signed in')
        },
      },
    )

    expect(result).toEqual({ data: null, error: 'Not signed in' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
