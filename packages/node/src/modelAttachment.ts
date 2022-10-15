import { upperFirst, camelCase } from 'lodash';
import fs from 'fs';
import { Analyzer, Service, AttachmentData, BlobData, Adapter, ID } from '@uplo/types';
import { generateKey } from '@uplo/utils';
import { UploError, BlobNotFoundError } from './errors';
import { SignerResult, Callbacks } from './types';
import { blobDataFromFileInput } from './blobDataFromFileInput';
import { Attachment } from './Attachment';

export interface ModelAttachmentOptions {
  multiple: boolean;
  service: string;
  contentType?: string | string[] | RegExp;
  directUpload?: boolean
}

interface ModelAttachmentParams {
  modelName: string;
  attachmentName: string;
  services: Record<string, Service>;
  adapter: Adapter;
  signer: SignerResult;
  callbacks: Callbacks;
  analyzers: Analyzer[];
  options: ModelAttachmentOptions
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
  };
}

class ModelAttachment {
  public modelName: string;
  public recordType: string;
  public attachmentName: string;
  public adapter: Adapter;
  public services: Record<string, Service>;
  public signer: SignerResult;
  public callbacks: Callbacks;
  public analyzers: Analyzer[];
  public options: ModelAttachmentOptions;

  constructor(params: ModelAttachmentParams) {
    this.modelName = params.modelName;
    this.attachmentName = params.attachmentName;
    this.adapter = params.adapter;
    this.services = params.services;
    this.signer = params.signer;
    this.callbacks = params.callbacks;
    this.analyzers = params.analyzers;
    this.options = params.options;

    this.recordType = upperFirst(camelCase(this.modelName));
  }

  async findOne(modelId: string) {
    if (this.options.multiple) {
      throw new UploError('Use findMany for multiple attachments');
    }

    const attachments = await this.adapter.findAttachments({
      recordId: modelId,
      recordType: this.recordType,
      name: this.attachmentName,
    });

    return this.getAttachment(attachments[0]);
  }

  async findMany(modelId: string) {
    if (!this.options.multiple) {
      throw new UploError('Use findOne for single attachment');
    }

    const results = await this.adapter.findAttachments({
      recordId: modelId,
      recordType: this.recordType,
      name: this.attachmentName,
    });

    return results.map(result => this.getAttachment(result));
  }

  async detach(modelId: ID, attachmentId?: ID) {
    if (this.options.multiple) {
      if (!attachmentId) {
        throw new UploError('Provide attachment ID when detaching attachment in multiple');
      }
      await this.adapter.deleteAttachment(attachmentId);
      return true;
    }

    await this.detachMany(modelId);

    return true;
  }

  async detachMany(modelId: ID) {
    await this.adapter.deleteAttachments({
      recordId: modelId,
      recordType: this.recordType,
      name: this.attachmentName,
    });

    return true;
  }

  async attachFile(
    modelId: string,
    { filePath, content: contentInput, ...params }: AttachFileOptions
  ) {
    if (!contentInput && !filePath) {
      throw new UploError('Provide filePath or content when attacing a file');
    }

    const content = filePath ? fs.createReadStream(filePath) : contentInput;
    const data = await blobDataFromFileInput(content);

    const blobParams = {
      key: generateKey(),
      fileName: params.fileName || data.fileName,
      contentType: params.contentType || data.contentType,
      size: params.size || data.size,
      checksum: params.checksum || data.checksum,
      metadata: params.metadata || {},
    };

    if (
      !blobParams.fileName ||
      !blobParams.contentType ||
      !blobParams.size ||
      !blobParams.checksum
    ) {
      throw new UploError('Missing data when attaching a file');
    }

    const blob = await this.adapter.createBlob({
      params: {
        key: blobParams.key,
        fileName: blobParams.fileName,
        contentType: blobParams.contentType,
        size: blobParams.size,
        checksum: blobParams.checksum,
        metadata: blobParams.metadata,
        serviceName: this.options.service,
      },
    });

    await this.getService(blob.service).upload({
      filePath,
      content: filePath ? fs.createReadStream(filePath) : contentInput,
      ...blob,
    });

    await this.getService(blob.service).updateMetadata(blob.key, {
      contentType: blob.contentType,
    });

    const result = await this.attachBlob(modelId, blob);

    return result;
  }

  async attachSignedFile(modelId: string, signedId: string) {
    const data = await this.signer.verify(signedId, 'blob');
    if (!data || !data.blobId) {
      throw new UploError(`Cannot verify signed ID for blob: ${signedId}`);
    }
    const { blobId } = data;

    if (this.callbacks.beforeAttach) {
      await this.callbacks.beforeAttach({ blobId });
    }

    const blob = await this.adapter.findBlob(blobId);

    if (!blob) {
      throw new BlobNotFoundError(`Cannot find blob with ID ${blobId}`);
    }

    await this.getService(blob.service).updateMetadata(blob.key, {
      contentType: blob.contentType,
    });

    const result = await this.attachBlob(modelId, blob);

    return result;
  }

  private async attachBlob(modelId: string, blob: BlobData) {
    const result = await this.adapter.attachBlob({
      blob,
      attachmentName: this.attachmentName,
      recordId: modelId,
      recordType: this.recordType,
      strategy: this.options.multiple ? 'many' : 'one',
    });

    const attachment = this.getAttachment(result);

    if (this.callbacks.afterAttach) {
      await this.callbacks.afterAttach({ blob: attachment.blob });
    }

    return attachment;
  }

  private getAttachment(data: AttachmentData) {
    return Attachment({ data, adapter: this.adapter, services: this.services, analyzers: this.analyzers });
  }

  private getService(serviceName: string) {
    const service = this.services[serviceName];

    if (!service) {
      throw new UploError(`Cannot find service with name ${serviceName}`);
    }

    return service;
  }
}

export default ModelAttachment;
