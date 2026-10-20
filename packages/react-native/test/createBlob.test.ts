import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('../src/utils/getFileInfo', () => ({
  getFileInfo: async () => ({ md5: '5d41402abc4b2a76b9719d911017c592', size: 5 }),
}))

const { createBlob } = await import('../src/createBlob')

const fetchMock = vi.fn<typeof fetch>(async () =>
  Response.json({ signedId: 'signed', upload: { url: 'https://storage.test', headers: {} } }),
)
vi.stubGlobal('fetch', fetchMock)

afterEach(() => {
  fetchMock.mockClear()
})

const file = { uri: 'file:///tmp/hello.txt', contentType: 'text/plain' }
const requestInit = () => fetchMock.mock.calls[0][1]!

describe('createBlob request options', () => {
  it('sends only JSON content type by default', async () => {
    await createBlob('user.avatar', file, { host: 'https://api.test' })

    expect(requestInit().headers).toEqual({ 'Content-Type': 'application/json' })
    expect(requestInit().credentials).toBeUndefined()
  })

  it('sends extra headers from a function and credentials', async () => {
    await createBlob('user.avatar', file, {
      host: 'https://api.test',
      headers: async () => ({ Authorization: 'Bearer abc' }),
      credentials: 'include',
    })

    expect(requestInit().headers).toEqual({
      Authorization: 'Bearer abc',
      'Content-Type': 'application/json',
    })
    expect(requestInit().credentials).toBe('include')
  })

  it('keeps JSON content type when a custom one is given', async () => {
    await createBlob('user.avatar', file, { host: '', headers: { 'CONTENT-TYPE': 'text/plain' } })

    expect(requestInit().headers).toEqual({ 'Content-Type': 'application/json' })
  })
})
