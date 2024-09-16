import DataLoader from 'dataloader';
import type { ID, AttachmentData } from '@uplo/types';
import { DrizzleAdapterOptions } from '..';
import { and, inArray, eq, or } from 'drizzle-orm';

type FindAttachmentsRecordData = {
  recordId: ID;
  recordType: string;
  name: string;
};

const SEPARATOR = '##__--__##';
type GroupReturn = {
  [groupName: string]: FindAttachmentsRecordData[];
};

const groupByTypeAndName = (data: Readonly<FindAttachmentsRecordData[]>) => {
  return data.reduce<GroupReturn>((obj, item) => {
    const groupName = [item.recordType, item.name].join(SEPARATOR);
    if (!obj[groupName]) {
      obj[groupName] = [];
    }

    obj[groupName].push(item);
    return obj;
  }, {});
};

export const findAttachmentsLoader = ({ db, schema }: DrizzleAdapterOptions) =>
  new DataLoader(async (recordData: Readonly<FindAttachmentsRecordData[]>) => {
    const grouped = groupByTypeAndName(recordData);
    const OR = Object.keys(grouped).map((groupName) => {
      const [recordType, name] = groupName.split(SEPARATOR);
      return and(
        eq(schema.fileAttachments.recordType, recordType),
        eq(schema.fileAttachments.name, name),
        inArray(
          schema.fileAttachments.recordId,
          grouped[groupName].map((item) => item.recordId as string)
        )
      );
    });

    const fileAttachments = await db
      .select()
      .from(schema.fileAttachments)
      .where(or(...OR));

    const result = recordData.map((recordItem) => {
      return fileAttachments.filter(
        (fileAttachment) =>
          fileAttachment.recordId === recordItem.recordId &&
          fileAttachment.recordType === recordItem.recordType &&
          fileAttachment.name === recordItem.name
      ) as AttachmentData[];
    });

    return Promise.resolve(result);
  });
