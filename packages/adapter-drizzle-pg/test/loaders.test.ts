import { drizzle } from 'drizzle-orm/pg-proxy'
import { describe, it, expect } from 'vitest'

import { createDrizzleAdapter } from '../src'
import * as schema from '../src/defaultSchema'
import { findAttachmentsLoader } from '../src/loaders/findAttachments'

// Columns in schema order: id, serviceName, key, fileName, contentType, size, checksum, metadata, createdAt
const blobRow = (id: string, fileName: string) => [
  id,
  's3',
  `key-${id}`,
  fileName,
  'image/png',
  '10',
  'checksum',
  {},
  '2026-01-01T00:00:00Z',
]

const createAdapter = () => {
  let rows = [blobRow('b1', 'old.png')]
  const queries: string[] = []
  const db = drizzle(async (sql) => {
    queries.push(sql)
    return { rows }
  })

  return {
    adapter: createDrizzleAdapter({ db: db as any, schema }),
    queries,
    setRows: (next: typeof rows) => (rows = next),
  }
}

describe('findBlob loader', () => {
  it('does not cache results between calls', async () => {
    const { adapter, queries, setRows } = createAdapter()

    expect((await adapter.findBlob('b1'))?.fileName).toEqual('old.png')
    setRows([blobRow('b1', 'new.png')])
    expect((await adapter.findBlob('b1'))?.fileName).toEqual('new.png')
    expect(queries).toHaveLength(2)
  })

  it('still batches loads in the same tick', async () => {
    const { adapter, queries, setRows } = createAdapter()
    setRows([blobRow('b1', 'one.png'), blobRow('b2', 'two.png')])

    const [one, two] = await Promise.all([adapter.findBlob('b1'), adapter.findBlob('b2')])
    expect([one?.fileName, two?.fileName]).toEqual(['one.png', 'two.png'])
    expect(queries).toHaveLength(1)
  })
})

// Columns in schema order: id, blobId, name, recordType, recordId, createdAt
const attachmentRow = (id: string) => [id, 'b1', 'images', 'Post', 'r1', '2026-01-01T00:00:00Z']

describe('findAttachments loader', () => {
  it('does not keep loaded keys', async () => {
    let rows = [attachmentRow('a1')]
    const queries: string[] = []
    const db = drizzle(async (sql) => {
      queries.push(sql)
      return { rows }
    })
    const loader = findAttachmentsLoader({ db: db as any, schema })
    // One key object, so a cache hit would be visible
    const key = { recordId: 'r1', recordType: 'Post', name: 'images' }

    await loader.load(key)
    rows = [attachmentRow('a2')]
    expect((await loader.load(key)).map((attachment) => attachment.id)).toEqual(['a2'])
    expect(queries).toHaveLength(2)
  })
})
