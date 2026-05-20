# @uplo/adapter-prisma

[Prisma](https://www.prisma.io) ORM adapter for [Uplo](https://uplo.js.org).

## Installation

```sh
npm i @uplo/adapter-prisma dataloader
```

## Usage

```ts
import { createPrismaAdapter } from '@uplo/adapter-prisma'

const uplo = createUplo({
  adapter: createPrismaAdapter({ prisma }),
})
```

## Prisma schema

```prisma
model FileAttachment {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name       String   @db.VarChar
  recordType String   @db.VarChar
  recordId   String   @db.Uuid
  blobId     String   @db.Uuid
  createdAt  DateTime @default(now()) @db.Timestamptz(6)

  blob       FileBlob @relation(fields: [blobId], references: [id])

  @@unique([recordType, recordId, name, blobId])
  @@index([recordType, recordId, name])
  @@index([blobId])
}

model FileBlob {
  id            String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  serviceName   String           @db.VarChar
  key           String           @unique @db.VarChar
  fileName      String           @db.VarChar
  contentType   String?          @db.VarChar
  size          BigInt
  checksum      String           @db.VarChar
  metadata      Json             @default("{}")
  createdAt     DateTime         @default(now()) @db.Timestamptz(6)

  attachments   FileAttachment[]
}
```

## Documentation

See the full docs at [uplo.js.org](https://uplo.js.org/adapters/prisma).
