import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import { ID, AttachmentData } from '@uplo/types';

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

export const initFindAttachmentsLoader = (prisma: PrismaClient) =>
  new DataLoader(async (recordData: Readonly<FindAttachmentsRecordData[]>) => {
    const grouped = groupByTypeAndName(recordData);
    const OR = Object.keys(grouped).map((groupName) => {
      const [recordType, name] = groupName.split(SEPARATOR);
      return {
        recordType,
        name,
        recordId: {
          in: grouped[groupName].map((item) => item.recordId as any),
        },
      };
    });

    const fileAttachments = (await prisma.fileAttachment.findMany({
      where: {
        OR,
      },
      include: {
        blob: true,
      },
    })) as AttachmentData[];

    const result = recordData.map((recordItem) => {
      return fileAttachments.filter(
        (fileAttachment) =>
          fileAttachment.recordId === recordItem.recordId &&
          fileAttachment.recordType === recordItem.recordType &&
          fileAttachment.name === recordItem.name
      );
    });

    return Promise.resolve(result);
  });
