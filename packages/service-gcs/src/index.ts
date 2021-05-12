import { Storage, GetSignedUrlConfig } from '@google-cloud/storage';
import BaseService, { Blob, Options as BaseOptions } from '@uplo/service-base';
import { contentDisposition, ContentDispositionType } from '@uplo/utils';

interface Options extends BaseOptions {
  bucket: string;
  credentialsPath: string;
}

class GCSService extends BaseService {
  bucket: string;
  storage: Storage;

  constructor({ bucket, credentialsPath, ...opts }: Options) {
    super(opts);
    this.bucket = bucket;
    this.storage = new Storage({
      keyFilename: credentialsPath,
    });
  }

  async directUploadUrl(blob: Blob) {
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      contentMd5: blob.checksum,
      contentType: 'application/octet-stream',
    };

    // Get a v4 signed URL for uploading file
    const [url] = await this.storage
      .bucket(this.bucket)
      .file(blob.key)
      .getSignedUrl(options);

    return url;
  }

  directUploadHeaders(
    blob: Blob,
    { disposition }: { disposition?: ContentDispositionType } = {}
  ) {
    return {
      'Content-MD5': blob.checksum,
      'Content-Disposition': contentDisposition({
        type: disposition,
        fileName: blob.fileName,
      }),
    };
  }

  async updateMetadata(
    key: string,
    {
      contentType,
      disposition,
      fileName,
    }: { contentType?: string; disposition?: ContentDispositionType, fileName?: string }
  ) {
    const metadata: { contentType?: string; contentDisposition?: string } = {};

    if (contentType) {
      metadata.contentType = contentType;
    }

    if (disposition && fileName) {
      metadata.contentDisposition = contentDisposition({
        type: disposition,
        fileName,
      });
    }

    return await this.storage
      .bucket(this.bucket)
      .file(key)
      .setMetadata(metadata);
  }

  async publicUrl(blob: Blob) {
    return await this.storage.bucket(this.bucket).file(blob.key).publicUrl();
  }

  async privateUrl(blob: Blob, { disposition, expiresIn = 300 }: { disposition?: ContentDispositionType, expiresIn?: number } = {}) {
    const options: GetSignedUrlConfig = {
      action: 'read',
      version: 'v4',
      expires: Date.now() + expiresIn * 1000,
      responseType: blob.contentType,
      responseDisposition: contentDisposition({
        type: disposition,
        fileName: blob.fileName,
      }),
    };

    // Get a v4 signed URL for uploading file
    const [url] = await this.storage
      .bucket(this.bucket)
      .file(blob.key)
      .getSignedUrl(options);

    return url;
  }

  async download({ key, path }: { key: string, path: string }) {
    return await this.storage
      .bucket(this.bucket)
      .file(key)
      .download({ destination: path });
  }

  async protocolUrl(blob: Blob) {
    return `gs://${this.bucket}/${blob.key}`;
  }

  defaultName(): string {
    return 'gcs';
  }
}

export default GCSService;
