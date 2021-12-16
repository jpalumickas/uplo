import BaseService, { Options as BaseOptions } from '@uplo/service-base';
import { Upload } from '@aws-sdk/lib-storage';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Blob } from '@uplo/types';

interface Options extends BaseOptions {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

class S3Service extends BaseService {
  bucket: string;
  region: string;
  s3Client: S3Client;
  options!: Options;

  constructor({ bucket, region, ...opts }: Options) {
    super(opts);
    this.bucket = bucket;
    this.region = region;
    this.s3Client = new S3Client(this.s3Config());
  }

  async directUploadUrl(blob: Blob) {
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

  async upload({ key, file, size, contentType, checksum }) {
    const parallelUploads3 = new Upload({
      client: this.s3Client,
      partSize: 5242880, // 5MB
      leavePartsOnError: false, // optional manually handle dropped parts
      params: {
        Bucket: this.bucket,
        Body: file,
        Key: key,
        ContentLength: Number(size),
        ContentType: contentType,
        ContentMD5: checksum,
      },
    });

    parallelUploads3.on('httpUploadProgress', (progress) => {
      console.log(progress);
    });

    await parallelUploads3.done();
  }

  directUploadHeaders(blob: Blob) {
    return {
      'Content-Type': blob.contentType,
      'Content-MD5': blob.checksum,
    };
  }

  async publicUrl({ key }: Blob) {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async privateUrl(
    { key }: Blob,
    { expiresIn = 300 }: { expiresIn?: number } = {}
  ) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async protocolUrl(blob: Blob) {
    return `s3://${this.bucket}/${blob.key}`;
  }

  defaultName(): string {
    return 's3';
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
