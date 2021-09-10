import { Blob, Service, ServiceUpdateMetadataOptions } from '@uplo/types';
import { file as tempyFile } from 'tempy';

export interface Options {
  isPublic?: boolean;
  name?: string;
}

class BaseService implements Service {
  isPublic: boolean;
  _name?: string;
  options: object;

  constructor({ isPublic = false, name, ...options }: Options) {
    this._name = name;
    this.options = options;
    this.isPublic = isPublic;
  }

  async url(blob: Blob, options?: object): Promise<string> {
    return this.isPublic ? this.publicUrl(blob) : this.privateUrl(blob, options);
  }

  async directUploadData(blob: Blob) {
    return {
      url: await this.directUploadUrl(blob),
      headers: await this.directUploadHeaders(blob),
    };
  }

  async updateMetadata(_key: string, _options: ServiceUpdateMetadataOptions): Promise<any> {}

  async publicUrl(_blob: Blob): Promise<string> {
    throw new Error('Not implemented');
  }

  async privateUrl(_blob: Blob, _options?: object): Promise<string> {
    throw new Error('Not implemented');
  }

  async protocolUrl(_blob: Blob): Promise<string> {
    throw new Error('Not implemented');
  }

  directUploadHeaders(_blob: Blob) {
    return {};
  }

  async directUploadUrl(_blob: Blob): Promise<string> {
    throw new Error('Not implemented');
  }

  download(_options: { key: string, path: string }) {
    throw new Error('Not implemented');
  }

  async downloadToTempfile({ key }: { key: string }, callback: (tmpPath: string) => void) {
    return await tempyFile.task(
      async (tmpPath) => {
        try {
          await this.download({ key, path: tmpPath });
          return await callback(tmpPath);
        } catch(err) {
          if (err instanceof Error) {
            console.error('[Uplo] Failed to download blob.', err.message);
          } else {
            console.error('[Uplo] Failed to download blob.');
          }

          return null;
        }
      }
    );
  }

  defaultName(): string {
    throw new Error('Not implemented');
  }

  name(): string {
    return this._name || this.defaultName();
  }
}

export default BaseService;
