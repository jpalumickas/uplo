import BaseService, { Blob } from '@uplo/service-base';
import { Storage, GetSignedUrlConfig } from '@google-cloud/storage';
import { contentDisposition } from '@uplo/utils';

class GCSService extends BaseService {
  storage: Storage;

  constructor(opts) {
    super(opts);
    this.storage = new Storage({
      keyFilename: opts.credentialsPath,
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
      .bucket(this.options.bucket)
      .file(blob.key)
      .getSignedUrl(options);

    return url;
  }

  directUploadHeaders(blob: Blob, { disposition } = {}) {
    return {
      'Content-MD5': blob.checksum,
      'Content-Disposition': contentDisposition({
        type: disposition,
        filename: blob.fileName,
      }),
    };
  }

  async updateMetadata(key, { contentType, disposition, filename }: { contentType: string }) {
    const metadata = {
      contentType,
    };

    if (disposition && filename) {
      metadata[contentDisposition] = contentDisposition({
        type: disposition,
        filename,
      });
    }

    return await this.storage
      .bucket(this.options.bucket)
      .file(key)
      .setMetadata(metadata);
  }

  async publicUrl(blob) {
    return await this.storage
      .bucket(this.options.bucket)
      .file(blob.key)
      .publicUrl();
  }

  async privateUrl(blob, { disposition, expiresIn = 300 } = {}) {
    const options: GetSignedUrlConfig = {
      action: 'read',
      version: 'v4',
      expires: Date.now() + expiresIn * 1000,
      responseType: blob.contentType,
      responseDisposition: contentDisposition({
        type: disposition,
        filename: blob.filename,
      }),
    };

    // Get a v4 signed URL for uploading file
    const [url] = await this.storage
      .bucket(this.options.bucket)
      .file(blob.key)
      .getSignedUrl(options);

    return url;
  }

  async protocolUrl(blob) {
    return `gs://${this.options.bucket}/${blob.key}`;
  }

  get defaultName() {
    return 'gcs';
  }
}

export default GCSService;
