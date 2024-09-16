// import { createWriteStream } from 'node:fs';
// import { Readable } from 'node:stream';
import { Upload } from '@aws-sdk/lib-storage';
import { contentDisposition, ContentDispositionType } from '@uplo/utils';
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
  requestHandler?: S3ClientConfig['requestHandler'];
}

const S3Service = ({
  isPublic = false,
  bucket,
  accessKeyId,
  secretAccessKey,
  endpoint,
  region = DEFAULT_REGION,
  forcePathStyle,
  requestHandler,
}: Options): Service => {
  const s3Config: S3ClientConfig = {
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    region: region,
    endpoint,
    forcePathStyle,
    requestHandler,
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
          ACL: isPublic ? 'public-read' : 'private',
        },
      });

      await parallelUploads3.done();
    },

    async delete({ key }: Pick<BlobData, 'key'>) {
      const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: key });
      await client.send(cmd);

      return true;
    },

    async download({
      key: _key,
      path: _path,
    }: {
      key: BlobData['key'];
      path: string;
    }) {
      throw new Error('Not implemented');
      //   const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      //   const s3Item = await client.send(command);
      //   if (s3Item.Body) {
      //     (s3Item.Body as Readable).pipe(createWriteStream(path));
      //   }
    },

    async directUploadHeaders(blob: BlobData) {
      const headers: HeadersInit = {
        'Content-Type': blob.contentType,
        'Content-MD5': blob.checksum,
      };

      if (isPublic) {
        headers['x-amz-acl'] = 'public-read';
      }

      return headers;
    },

    async publicUrl({ key }: Pick<BlobData, 'key'>) {
      if (endpoint) {
        return `${endpoint}/${bucket}/${key}`;
      } else {
        return `https://${bucket}.s3${region === DEFAULT_REGION ? '' : `.${region}`}.amazonaws.com/${key}`;
      }
    },

    async privateUrl(
      blob: BlobData,
      {
        disposition,
        expiresIn = 300,
      }: { disposition?: ContentDispositionType; expiresIn?: number } = {}
    ) {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: blob.key,
        ResponseContentType: blob.contentType,
        ResponseContentDisposition:
          disposition &&
          contentDisposition({
            type: disposition,
            fileName: blob.fileName,
          }),
      });

      return await getSignedUrl(client, command, { expiresIn });
    },

    async protocolUrl(blob: BlobData) {
      return `s3://${bucket}/${blob.key}`;
    },
  };
};

export default S3Service;
