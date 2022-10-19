import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { Upload } from '@aws-sdk/lib-storage';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Service, BlobData, ServiceUploadParams } from '@uplo/types';

interface Options {
  isPublic?: boolean;
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

class S3Service implements Service {
  isPublic: boolean;
  bucket: string;
  region: string;
  s3Client: S3Client;
  options!: Options;

  constructor({ bucket, region, isPublic = false }: Options) {
    this.isPublic = isPublic;
    this.bucket = bucket;
    this.region = region;
    this.s3Client = new S3Client(this.s3Config());
  }

  async directUploadUrl(blob: BlobData) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      // ContentDisposition: `attachment; filename="${fileName}"`,
      ContentLength: Number(blob.size),
      ContentType: blob.contentType,
      ContentMD5: blob.checksum,
      ACL: this.isPublic ? 'public-read' : 'private',
      Key: blob.key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 300 });
  }

  async upload({ key, content, size, contentType, checksum }: ServiceUploadParams) {
    const parallelUploads3 = new Upload({
      client: this.s3Client,
      partSize: 5242880, // 5MB
      leavePartsOnError: false, // optional manually handle dropped parts
      params: {
        Bucket: this.bucket,
        Body: content,
        Key: key,
        ContentLength: Number(size),
        ContentType: contentType,
        ContentMD5: checksum,
      },
    });

    await parallelUploads3.done();
  }

  async delete({ key }: Pick<BlobData, 'key'>) {
    await this.s3Client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );

    return true;
  }

  async download({ key, path }: { key: BlobData['key'], path: string }) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const s3Item = await this.s3Client.send(command);
    if (s3Item.Body) {
      (s3Item.Body as Readable).pipe(createWriteStream(path))
    }
  }

  async directUploadHeaders(blob: BlobData) {
    return {
      'Content-Type': blob.contentType,
      'Content-MD5': blob.checksum,
    };
  }

  async publicUrl({ key }: Pick<BlobData, 'key'>) {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async privateUrl(
    { key }: BlobData,
    { expiresIn = 300 }: { expiresIn?: number } = {}
  ) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async protocolUrl(blob: BlobData) {
    return `s3://${this.bucket}/${blob.key}`;
  }

  s3Config() {
    const { accessKeyId, secretAccessKey } = this.options;

    const config = {
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region: this.region,
    };

    return config;
  }
}

export default S3Service;
