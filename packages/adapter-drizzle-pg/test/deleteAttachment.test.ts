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

const options = { id: 'a1', recordId: 'r1', recordType: 'Post', name: 'images' }

describe('deleteAttachment', () => {
  it('deletes only when id, record and name match', async () => {
    const { adapter, queries } = createAdapter([])
    await adapter.deleteAttachment(options)

    expect(queries).toHaveLength(1)
    expect(queries[0].sql).toMatch(/^delete from "file_attachments" where/)
    for (const column of ['id', 'record_id', 'record_type', 'name']) {
      expect(queries[0].sql).toContain(`"file_attachments"."${column}" = $`)
    }
    expect(queries[0].params).toEqual(['a1', 'r1', 'Post', 'images'])
  })

  it('returns null when nothing matched', async () => {
    const { adapter } = createAdapter([])

    await expect(adapter.deleteAttachment(options)).resolves.toBeNull()
  })
})

describe('findBlobAttachments', () => {
  it('selects attachments by blob ID', async () => {
    const { adapter, queries } = createAdapter([])

    await expect(adapter.findBlobAttachments('b1')).resolves.toEqual([])
    expect(queries[0].sql).toMatch(
      /^select .* from "file_attachments" where "file_attachments"."blob_id" = \$1$/,
    )
    expect(queries[0].params).toEqual(['b1'])
  })
})
