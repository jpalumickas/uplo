import fs from 'node:fs';
import upperFirst from 'lodash-es/upperFirst';
import camelCase from 'lodash-es/camelCase';
import { Analyzer, Service, AttachmentData, BlobData, Adapter, ID } from '@uplo/types';
import { generateKey } from '@uplo/utils';
import { UploError, BlobNotFoundError } from '../errors';
import { Callbacks } from '../types';
import { Signer } from '../Signer';
import { Attachment } from '../Attachment';
import { blobDataFromFileInput } from './blobDataFromFileInput';

export interface ModelAttachmentOptions {
  multiple: boolean;
  serviceName: string;
  contentType?: string | string[] | RegExp;
  directUpload?: boolean
}

interface ModelAttachmentParams {
  modelId: ID;
  modelName: string;
  attachmentName: string;
  services: Record<string, Service>;
  adapter: Adapter;
  signer: ReturnType<typeof Signer>;
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

export class ModelAttachment {
  public modelId: ID;
  public modelName: string;
  public recordType: string;
  public attachmentName: string;
  public adapter: Adapter;
  public services: Record<string, Service>;
  public signer: ReturnType<typeof Signer>;
  public callbacks: Callbacks;
  public analyzers: Analyzer[];
  public options: ModelAttachmentOptions;

  constructor(params: ModelAttachmentParams) {
    this.modelId = params.modelId;
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

  async findOne() {
    if (this.options.multiple) {
      throw new UploError('Use findMany for multiple attachments');
    }

    const attachments = await this.adapter.findAttachments({
      recordId: this.modelId,
      recordType: this.recordType,
      name: this.attachmentName,
    });

    return attachments[0] ? this.buildAttachment(attachments[0]) : null;
  }

  async findMany() {
    if (!this.options.multiple) {
      throw new UploError('Use findOne for single attachment');
    }

    const results = await this.adapter.findAttachments({
      recordId: this.modelId,
      recordType: this.recordType,
      name: this.attachmentName,
    });

    return results.map(result => this.buildAttachment(result));
  }

  async detach(attachmentId?: ID) {
    if (this.options.multiple) {
      if (!attachmentId) {
        throw new UploError('Provide attachment ID when detaching attachment in multiple');
      }
      await this.adapter.deleteAttachment(attachmentId);
      return true;
    }

    await this.detachMany();

    return true;
  }

  async detachMany() {
    await this.adapter.deleteAttachments({
      recordId: this.modelId,
      recordType: this.recordType,
      name: this.attachmentName,
    });

    return true;
  }

  async attachFile(
    { filePath, content: contentInput, ...params }: AttachFileOptions
  ) {
    if (!contentInput && !filePath) {
      throw new UploError('Provide filePath or content when attacing a file');
    }

    const content = filePath ? fs.createReadStream(filePath) : contentInput;
    // @ts-ignore
    const data = await blobDataFromFileInput(content);

    const blobParams = {
      key: await generateKey(),
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
        serviceName: this.options.serviceName,
      },
    });

    await this.getService(blob.serviceName).upload({
      filePath,
    // @ts-ignore
      content: filePath ? fs.createReadStream(filePath) : contentInput,
      ...blob,
    });

    const updateMetadataFn = this.getService(blob.serviceName).updateMetadata;

    if (updateMetadataFn) {
      await updateMetadataFn(blob.key, {
        contentType: blob.contentType,
      });
    }

    const result = await this.attachBlob(blob);

    return result;
  }

  async attachSignedFile(signedId: string) {
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

    const updateMetadataFn = this.getService(blob.serviceName).updateMetadata;

    if (updateMetadataFn) {
      await updateMetadataFn(blob.key, {
        contentType: blob.contentType,
      });
    }

    const result = await this.attachBlob(blob);

    return result;
  }

  private async attachBlob(blob: BlobData) {
    const result = await this.adapter.attachBlob({
      blob,
      attachmentName: this.attachmentName,
      recordId: this.modelId,
      recordType: this.recordType,
      append: this.options.multiple,
    });

    const attachment = this.buildAttachment(result);

    if (this.callbacks.afterAttach) {
      await this.callbacks.afterAttach({ blob: attachment.blob });
    }

    return attachment;
  }

  private buildAttachment(data: AttachmentData) {
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
