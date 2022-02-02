import { upperFirst, camelCase } from 'lodash';
import fs from 'fs';
import { Service, Blob, Adapter } from '@uplo/types';
import { generateKey } from '@uplo/utils';
import { SignerResult, Callbacks } from './types';
import { blobDataFromFileInput } from './blobDataFromFileInput';

interface ModelAttachmentOptions {
  modelName: string;
  attachmentName: string;
  service: Service;
  adapter: Adapter;
  multiple: boolean;
  signer: SignerResult;
  callbacks: Callbacks;
}

interface AttachFileOptions {
  filePath?: string;
  content?: string | Buffer;
  fileName?: string;
  contentType?: string;
  size?: number;
  checksum?: string;
  metadata?: {
    [key: string]: string | number | null;
  }
}

class ModelAttachment {
  public options: ModelAttachmentOptions;
  public modelName: string;
  public attachmentName: string;
  public multiple: boolean;
  public adapter: Adapter;
  public service: Service;
  public signer: SignerResult;
  public callbacks: Callbacks;

  constructor(options: ModelAttachmentOptions) {
    this.options = options;
    this.modelName = options.modelName;
    this.attachmentName = options.attachmentName;
    this.multiple = options.multiple;
    this.adapter = options.adapter;
    this.service = options.service;
    this.signer = options.signer;
    this.callbacks = options.callbacks;
  }

  async attachFile(modelId: string, { filePath, content: contentInput, ...params }: AttachFileOptions) {
    const content = filePath ? fs.createReadStream(filePath) : contentInput;

    if (!content) {
      throw new Error('Provide filePath or content');
    }

    const data = await blobDataFromFileInput(content);

    const blobParams = {
      key: generateKey(),
      fileName: params.fileName || data.fileName,
      contentType: params.contentType || data.contentType,
      size: params.size || data.size,
      checksum: params.checksum || data.checksum,
      metadata: params.metadata,
    };

    if (!blobParams.fileName) {
      throw new Error('Missing data');
    }

    const blob = await this.adapter.createBlob({
      params: blobParams,
      service: this.service,
    });

    this.service.upload({
      content,
      ...blob,
    });

    const result = this.attachBlob(modelId, blob);
    return result;
  }

  async attachSignedFile(modelId: string, signedId: string) {
    const data = await this.signer.verify(signedId, 'blob');
    if (!data || !data.blobId) {
      throw new Error(`[Uplo] Cannot verify signed id for blob: ${signedId}`);
    }
    const { blobId } = data;

    const blob = await this.adapter.findBlob(blobId);

    if (!blob) {
      throw new Error(`[Uplo] Cannot find blob with id ${blobId}`);
    }

    await this.service.updateMetadata(blob.key, {
      contentType: blob.contentType,
    });

    const result = this.attachBlob(modelId, blob);

    if (this.callbacks.afterAttach) {
      await this.callbacks.afterAttach({ blob });
    }

    return result;
  }

  private async attachBlob(modelId: string, blob: Blob) {
    const recordType = upperFirst(camelCase(this.modelName));

    const result = await this.adapter.attachBlob({
      blob,
      attachmentName: this.attachmentName,
      recordId: modelId,
      recordType,
      strategy: this.multiple ? 'many' : 'one',
    });

    return result;
  }
}

export default ModelAttachment;
