import { eq, and, asc, gt, lt, notExists, sql } from 'drizzle-orm'
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'

import { BlobNotFoundError } from '@uplo/server'
import type { Adapter, BlobData } from '@uplo/types'

import type * as defaultSchema from './defaultSchema'
import { loaders as initLoaders } from './loaders'

export interface DrizzleAdapterOptions {
  db: PgDatabase<PgQueryResultHKT>
  schema: any
}

export const createDrizzleAdapter = ({
  db,
  schema: plainSchema,
}: DrizzleAdapterOptions): Adapter => {
  const schema = plainSchema as typeof defaultSchema
  const loaders = initLoaders({ db, schema })

  return {
    findAttachments: async ({
      recordId,
      recordType,
      name,
    }: {
      recordId: string | number
      recordType: string
      name: string
    }) => {
      const attachments = await loaders.findAttachments.load({
        recordId,
        recordType,
        name,
      })

      const blobIds = attachments.map((attachment) => attachment.blobId)
      const blobs = (await loaders.findBlob.loadMany(blobIds)) as BlobData[]

      return attachments.map((attachment) => {
        const blob = blobs.find((it) => it?.id === attachment.blobId)!
        return {
          ...attachment,
          blob,
        }
      })
    },
    deleteAttachment: async ({ id, recordId, recordType, name }) => {
      const [attachment] = await db
        .delete(schema.fileAttachments)
        .where(
          and(
            eq(schema.fileAttachments.id, id),
            eq(schema.fileAttachments.recordId, recordId as string),
            eq(schema.fileAttachments.recordType, recordType),
            eq(schema.fileAttachments.name, name),
          ),
        )
        .returning()

      return attachment ?? null
    },
    findBlobAttachments: async (blobId) => {
      return await db
        .select()
        .from(schema.fileAttachments)
        .where(eq(schema.fileAttachments.blobId, blobId))
    },
    deleteAttachments: async ({ recordId, recordType, name }) => {
      const attachments = await db
        .delete(schema.fileAttachments)
        .where(
          and(
            eq(schema.fileAttachments.recordId, recordId as string),
            eq(schema.fileAttachments.recordType, recordType),
            eq(schema.fileAttachments.name, name),
          ),
        )
        .returning()

      return attachments
    },
    findUnattachedBlobs: async ({ olderThan, limit, afterId }) => {
      const blobs = await db
        .select()
        .from(schema.fileBlobs)
        .where(
          and(
            lt(schema.fileBlobs.createdAt, olderThan),
            afterId === undefined ? undefined : gt(schema.fileBlobs.id, afterId),
            notExists(
              db
                .select({ one: sql`1` })
                .from(schema.fileAttachments)
                .where(eq(schema.fileAttachments.blobId, schema.fileBlobs.id)),
            ),
          ),
        )
        .orderBy(asc(schema.fileBlobs.id))
        .limit(limit)

      return blobs as BlobData[]
    },
    deleteUnattachedBlob: async (id) => {
      const [blob] = await db
        .delete(schema.fileBlobs)
        .where(
          and(
            eq(schema.fileBlobs.id, id),
            notExists(
              db
                .select({ one: sql`1` })
                .from(schema.fileAttachments)
                .where(eq(schema.fileAttachments.blobId, schema.fileBlobs.id)),
            ),
          ),
        )
        .returning()

      return (blob as BlobData | undefined) ?? null
    },
    createBlob: async ({ params }) => {
      const [blob] = await db
        .insert(schema.fileBlobs)
        .values({
          // @ts-expect-error
          key: params.key,
          fileName: params.fileName,
          contentType: params.contentType,
          size: params.size,
          metadata: params.metadata || {},
          checksum: params.checksum,
          serviceName: params.serviceName,
        })
        .returning()

      return blob
    },
    findBlob: async (id) => {
      const blob = await loaders.findBlob.load(id)
      return blob
    },
    findBlobByKey: async (key) => {
      const [blob] = await db
        .select()
        .from(schema.fileBlobs)
        .where(eq(schema.fileBlobs.key, key))
        .limit(1)

      return blob || null
    },
    updateBlobMetadata: async ({ key, metadata }) => {
      return await db.transaction(async (trx) => {
        const [blob] = await trx
          .select({
            id: schema.fileBlobs.id,
            metadata: schema.fileBlobs.metadata,
          })
          .from(schema.fileBlobs)
          .where(eq(schema.fileBlobs.key, key))
          .limit(1)

        if (!blob) {
          throw new BlobNotFoundError(`Blob not found with key ${key}`)
        }

        const newMetadata = { ...blob.metadata, ...metadata }

        const [updatedBlob] = await trx
          .update(schema.fileBlobs)
          .set({
            metadata: newMetadata,
          })
          .where(eq(schema.fileBlobs.id, blob.id))
          .returning()

        return updatedBlob
      })
    },
    attachBlob: async ({ blob, attachmentName, recordId, recordType, append = false }) => {
      if (!append) {
        await db
          .delete(schema.fileAttachments)
          .where(
            and(
              eq(schema.fileAttachments.recordId, recordId as string),
              eq(schema.fileAttachments.recordType, recordType),
              eq(schema.fileAttachments.name, attachmentName),
            ),
          )
      }

      const [attachment] = await db
        .insert(schema.fileAttachments)
        .values({
          blobId: blob.id as string,
          name: attachmentName,
          recordType,
          recordId: recordId as string,
        })
        .returning()

      return {
        ...attachment,
        blob,
      }
    },
  }
}
