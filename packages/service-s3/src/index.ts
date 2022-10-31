import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { Upload } from '@aws-sdk/lib-storage';
import {
  S3ClientConfig,
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Service, BlobData, ServiceUploadParams } from '@uplo/types';

const DEFAULT_REGION = 'us-east-1';

interface Options {
  isPublic?: boolean;
  bucket: string;
  region?: S3ClientConfig['region'];
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: S3ClientConfig['endpoint'];
  forcePathStyle?: S3ClientConfig['forcePathStyle'];
}

const S3Service = ({
  isPublic = false,
  bucket,
  accessKeyId,
  secretAccessKey,
  endpoint,
  region = DEFAULT_REGION,
  forcePathStyle,
}: Options): Service => {
  const s3Config: S3ClientConfig = {
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    region: region,
    endpoint,
    forcePathStyle,
  };

  const client = new S3Client(s3Config);

  return {
    isPublic,
    async directUploadUrl(blob: BlobData) {
      const command = new PutObjectCommand({
        Bucket: bucket,
        // ContentDisposition: `attachment; filename="${fileName}"`,
        ContentLength: Number(blob.size),
        ContentType: blob.contentType,
        ContentMD5: blob.checksum,
        ACL: isPublic ? 'public-read' : 'private',
        Key: blob.key,
      });

      return await getSignedUrl(client, command, { expiresIn: 300 });
    },

    async upload({
      key,
      content,
      size,
      contentType,
      checksum,
    }: ServiceUploadParams) {
      const parallelUploads3 = new Upload({
        client,
        partSize: 5242880, // 5MB
        leavePartsOnError: false, // optional manually handle dropped parts
        params: {
          Bucket: bucket,
          Body: content,
          Key: key,
          ContentLength: Number(size),
          ContentType: contentType,
          ContentMD5: checksum,
        },
      });

      await parallelUploads3.done();
    },

    async delete({ key }: Pick<BlobData, 'key'>) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

      return true;
    },

    async download({ key, path }: { key: BlobData['key']; path: string }) {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const s3Item = await client.send(command);
      if (s3Item.Body) {
        (s3Item.Body as Readable).pipe(createWriteStream(path));
      }
    },

    async directUploadHeaders(blob: BlobData) {
      return {
        'Content-Type': blob.contentType,
        'Content-MD5': blob.checksum,
      };
    },

    async publicUrl({ key }: Pick<BlobData, 'key'>) {
      const publicEndpoint = endpoint
        ? endpoint
        : `https://${bucket}.s3${region === DEFAULT_REGION ? '' :  `.${region}`}.amazonaws.com`;
      return `${publicEndpoint}/${key}`;
    },

    async privateUrl(
      { key }: BlobData,
      { expiresIn = 300 }: { expiresIn?: number } = {}
    ) {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      return await getSignedUrl(client, command, { expiresIn });
    },

    async protocolUrl(blob: BlobData) {
      return `s3://${bucket}/${blob.key}`;
    },
  };
};

export default S3Service;
