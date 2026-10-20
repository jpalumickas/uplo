import { drizzle } from 'drizzle-orm/pg-proxy'
import { describe, it, expect } from 'vitest'

import { createDrizzleAdapter } from '../src'
import * as schema from '../src/defaultSchema'

const createAdapter = (rows: unknown[][]) => {
  const queries: { sql: string; params: unknown[] }[] = []
  const db = drizzle(async (sql, params) => {
    queries.push({ sql, params })
    return { rows }
  })

  return { adapter: createDrizzleAdapter({ db: db as any, schema }), queries }
}

const notAttached =
  'not exists (select 1 from "file_attachments" where "file_attachments"."blob_id" = "file_blobs"."id")'

describe('findUnattachedBlobs', () => {
  it('selects old blobs without attachments ordered by id', async () => {
    const { adapter, queries } = createAdapter([])
    const olderThan = new Date('2026-10-20T00:00:00Z')

    await expect(adapter.findUnattachedBlobs!({ olderThan, limit: 50 })).resolves.toEqual([])
    expect(queries[0].sql).toContain('"file_blobs"."created_at" < $1')
    expect(queries[0].sql).toContain(notAttached)
    expect(queries[0].sql).not.toContain('"file_blobs"."id" > ')
    expect(queries[0].sql).toMatch(/order by "file_blobs"."id" asc limit \$2$/)
    expect(queries[0].params).toEqual([olderThan.toISOString(), 50])
  })

  it('continues after afterId', async () => {
    const { adapter, queries } = createAdapter([])

    await adapter.findUnattachedBlobs!({ olderThan: new Date(), limit: 50, afterId: 'b9' })
    expect(queries[0].sql).toContain('"file_blobs"."id" > $2')
    expect(queries[0].params[1]).toBe('b9')
  })
})

describe('deleteUnattachedBlob', () => {
  it('deletes the blob only when nothing is attached', async () => {
    const { adapter, queries } = createAdapter([])

    await expect(adapter.deleteUnattachedBlob!('b1')).resolves.toBeNull()
    expect(queries).toHaveLength(1)
    expect(queries[0].sql).toMatch(/^delete from "file_blobs" where/)
    expect(queries[0].sql).toContain('"file_blobs"."id" = $1')
    expect(queries[0].sql).toContain(notAttached)
    expect(queries[0].sql).toContain('returning')
    expect(queries[0].params).toEqual(['b1'])
  })
})
