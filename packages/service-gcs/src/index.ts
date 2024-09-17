import fs from 'node:fs';
import { Storage, GetSignedUrlConfig } from '@google-cloud/storage';
import { Service, ServiceUploadParams, BlobData } from '@uplo/types';
import { contentDisposition, ContentDispositionType } from '@uplo/utils';

interface Options {
  isPublic?: boolean;
  bucket: string;
  credentialsPath: string;
}

class GCSService implements Service {
  isPublic: boolean;
  bucket: string;
  storage: Storage;

  constructor({ bucket, credentialsPath }: Options) {
    this.isPublic = false;
    this.bucket = bucket;
    this.storage = new Storage({
      keyFilename: credentialsPath,
    });

    this.updateMetadata = this.updateMetadata.bind(this);
  }

  async directUploadUrl(blob: BlobData, { expiresIn = 5 * 60 * 1000 } = {}) {
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + expiresIn,
      contentMd5: blob.checksum,
      contentType: blob.contentType, //'application/octet-stream',
    };

    // Get a v4 signed URL for uploading file
    const [url] = await this.storage
      .bucket(this.bucket)
      .file(blob.key)
      .getSignedUrl(options);

    return url;
  }

  async directUploadHeaders(
    blob: BlobData,
    { disposition }: { disposition?: ContentDispositionType } = {}
  ) {
    return {
      'Content-Type': blob.contentType,
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
    }: {
      contentType: string;
      disposition?: ContentDispositionType;
      fileName?: string;
    }
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

  async publicUrl(blob: BlobData) {
    return await this.storage.bucket(this.bucket).file(blob.key).publicUrl();
  }

  async privateUrl(
    blob: BlobData,
    {
      disposition,
      expiresIn = 300,
    }: { disposition?: ContentDispositionType; expiresIn?: number } = {}
  ) {
    const options: GetSignedUrlConfig = {
      action: 'read',
      version: 'v4',
      expires: Date.now() + expiresIn * 1000,
      responseType: blob.contentType,
      responseDisposition:
        disposition &&
        contentDisposition({
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

  async upload({ key, content, contentType }: ServiceUploadParams) {
    const file = this.storage.bucket(this.bucket).file(key);

    if (content instanceof fs.ReadStream) {
      return new Promise((resolve, reject) => {
        content
          .pipe(
            file.createWriteStream({
              resumable: false,
              metadata: { contentType },
            })
          )
          .on('error', (err) => {
            reject(err);
          })
          .on('finish', (e: any) => {
            resolve(e);
          });
      });
    } else if (content instanceof globalThis.Blob) {
      throw new Error('Blob not implemented');
    } else if (content instanceof ReadableStream) {
      throw new Error('ReadableStream not implemented');
    }

    return await file.save(content);
  }

  async download({ key, path }: { key: BlobData['key']; path: string }) {
    return await this.storage
      .bucket(this.bucket)
      .file(key)
      .download({ destination: path });
  }

  async delete({ key }: { key: BlobData['key'] }) {
    await this.storage.bucket(this.bucket).file(key).delete();
    return true;
  }

  async protocolUrl(blob: BlobData) {
    return `gs://${this.bucket}/${blob.key}`;
  }

  defaultName(): string {
    return 'gcs';
  }
}

export default GCSService;
