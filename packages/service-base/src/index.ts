export interface Blob {
  fileName: string;
  size: number;
  contentType: string;
  checksum: string;
  key: string;
}

export interface Options {
  isPublic?: boolean;
  name?: string;
}

class BaseService {
  isPublic: boolean;
  _name?: string;
  options: object;

  constructor({ isPublic = false, name, ...options }: Options) {
    this._name = name;
    this.options = options;
    this.isPublic = isPublic;
  }

  async url(blob: Blob ) {
    return this.isPublic ? this.publicUrl(blob) : this.privateUrl(blob);
  }

  async directUploadData(blob: Blob) {
    return {
      url: await this.directUploadUrl(blob),
      headers: await this.directUploadHeaders(blob),
    };
  }

  async updateMetadata() {}

  publicUrl(blob: Blob) {
    throw new Error('Not implemented');
  }

  privateUrl(blob: Blob) {
    throw new Error('Not implemented');
  }

  directUploadHeaders(blob: Blob) {
    return {};
  }

  directUploadUrl(blob: Blob) {
    throw new Error('Not implemented');
  }

  defaultName(): string {
    throw new Error('Not implemented');
  }

  name() {
    return this._name || this.defaultName();
  }
}

export default BaseService;
