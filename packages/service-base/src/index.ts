import { Blob, Service, ServiceUpdateMetadataOptions, ServiceUploadParams } from '@uplo/types';
import { Options } from './types';

abstract class BaseService implements Service {
  public isPublic: boolean;
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

  async upload(_params: ServiceUploadParams) {
    throw new Error('Not implemented: upload');
  }

  async delete(_blob: Blob): Promise<boolean> {
    throw new Error('Not implemented: delete');
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
}

export * from './types';

export default BaseService;
