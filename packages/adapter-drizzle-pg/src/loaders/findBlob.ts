import DataLoader from 'dataloader';
import { ID } from '@uplo/types';
import { DrizzleAdapterOptions } from '..';
import { inArray } from 'drizzle-orm';

export const findBlobLoader = ({ db, schema }: DrizzleAdapterOptions) =>
  new DataLoader(async (blobIds: Readonly<ID[]>) => {
    if (blobIds.length === 0) {
      return Promise.resolve([]);
    }

    const blobs = await db
      .select()
      .from(schema.fileBlobs)
      .where(inArray(schema.fileBlobs.id, [...blobIds]));

    const result = blobIds.map((blobId) => {
      return blobs.find((blob) => blob.id === blobId) || null;
    });

    return Promise.resolve(result);
  });
