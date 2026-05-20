# @uplo/adapter-drizzle-pg

[Drizzle ORM](https://orm.drizzle.team) PostgreSQL adapter for [Uplo](https://uplo.js.org).

## Installation

```sh
npm i @uplo/adapter-drizzle-pg dataloader
```

## Usage

```ts
import { createDrizzleAdapter } from '@uplo/adapter-drizzle-pg'

const uplo = createUplo({
  adapter: createDrizzleAdapter({ db, schema }),
})
```

## Example schema

```ts
const id = serial('id').primaryKey().$type<Blob['id']>()

const createdAt = timestamp('created_at', {
  precision: 6,
  withTimezone: true,
})
  .defaultNow()
  .notNull()

export const fileAttachments = pgTable('file_attachments', {
  id,
  blobId: integer('blob_id').notNull().$type<Blob['id']>(),
  name: varchar('name').notNull(),
  recordType: varchar('record_type').notNull(),
  recordId: integer('record_id').notNull(),
  createdAt,
})

export const fileBlobs = pgTable('file_blobs', {
  id,
  serviceName: varchar('service_name').notNull(),
  key: varchar('key').notNull(),
  fileName: varchar('file_name').notNull(),
  contentType: varchar('content_type').notNull(),
  size: bigint('size', { mode: 'bigint' }).notNull(),
  checksum: varchar('checksum').notNull(),
  metadata: jsonb('metadata').default({}).$type<Blob['metadata']>().notNull(),
  createdAt,
})
```

## Documentation

See the full docs at [uplo.js.org](https://uplo.js.org/adapters/drizzle).
