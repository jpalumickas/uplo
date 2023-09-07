import camelCase from 'camelcase';
import { Service, AttachmentData, BlobData, Adapter, ID } from '@uplo/types';
import { generateKey } from '@uplo/utils';
import { UploError, BlobNotFoundError } from '../errors';
import { Callbacks } from '../types';
import { Signer } from '../Signer';
import { Attachment } from '../Attachment';
import { BlobInput } from '../blobInputs/types';

export interface ModelAttachmentOptions {
  multiple: boolean;
  serviceName: string;
  contentType?: string | string[] | RegExp;
  directUpload?: boolean;
}

interface ModelAttachmentParams {
  modelId: ID;
  modelName: string;
  attachmentName: string;
  services: Record<string, Service>;
  adapter: Adapter;
  signer: ReturnType<typeof Signer>;
  callbacks: Callbacks;
  options: ModelAttachmentOptions;
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
  public options: ModelAttachmentOptions;

  constructor(params: ModelAttachmentParams) {
    this.modelId = params.modelId;
    this.modelName = params.modelName;
    this.attachmentName = params.attachmentName;
    this.adapter = params.adapter;
    this.services = params.services;
    this.signer = params.signer;
    this.callbacks = params.callbacks;
    this.options = params.options;

    this.recordType = camelCase(this.modelName, { pascalCase: true });
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

    return results.map((result) => this.buildAttachment(result));
  }

  async detach(attachmentId?: ID) {
    if (this.options.multiple) {
      if (!attachmentId) {
        throw new UploError(
          'Provide attachment ID when detaching attachment in multiple'
        );
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

  async attachFile(input: BlobInput) {
    const blobParams = {
      key: await generateKey(),
      fileName: input.fileName,
      contentType: input.contentType,
      size: input.size,
      checksum: input.checksum,
      metadata: {},
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
      content: input.content,
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
    return Attachment({ data, adapter: this.adapter, services: this.services });
  }

  private getService(serviceName: string) {
    const service = this.services[serviceName];

    if (!service) {
      throw new UploError(`Cannot find service with name ${serviceName}`);
    }

    return service;
  }
}
