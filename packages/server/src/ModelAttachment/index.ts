import camelCase from 'camelcase'

import type { Service, AttachmentData, BlobData, Adapter, ID, BlobStoragePath } from '@uplo/types'

import { Attachment } from '../Attachment'
import type { BlobInput } from '../blobInputs/types'
import {
  UploError,
  AttachmentNotFoundError,
  BlobAlreadyAttachedError,
  BlobNotFoundError,
  DirectUploadDisabledError,
  InvalidSignedIdError,
} from '../errors'
import { buildBlobKey } from '../lib/buildBlobKey'
import type { Signer } from '../Signer'
import type { AttachmentValidateType, Callbacks } from '../types'
import { validateBlobInputData } from '../utils/validateBobInputData'
import { verifyUploadedObject } from '../utils/verifyUploadedObject'

export interface ModelAttachmentOptions {
  multiple: boolean
  serviceName: string
  directUpload?: boolean
  validate?: AttachmentValidateType
  storagePath?: BlobStoragePath
}

interface ModelAttachmentParams {
  modelId: ID
  modelName: string
  attachmentName: string
  services: Record<string, Service>
  adapter: Adapter
  signer: ReturnType<typeof Signer>
  callbacks: Callbacks
  options: ModelAttachmentOptions
}

export class ModelAttachment {
  public modelId: ID
  public modelName: string
  public recordType: string
  public attachmentName: string
  public adapter: Adapter
  public services: Record<string, Service>
  public signer: ReturnType<typeof Signer>
  public callbacks: Callbacks
  public options: ModelAttachmentOptions

  constructor(params: ModelAttachmentParams) {
    this.modelId = params.modelId
    this.modelName = params.modelName
    this.attachmentName = params.attachmentName
    this.adapter = params.adapter
    this.services = params.services
    this.signer = params.signer
    this.callbacks = params.callbacks
    this.options = params.options

    this.recordType = camelCase(this.modelName, { pascalCase: true })
  }

  async findOne() {
    if (this.options.multiple) {
      throw new UploError('Use findMany for multiple attachments')
    }

    const attachments = await this.adapter.findAttachments({
      recordId: this.modelId,
      recordType: this.recordType,
      name: this.attachmentName,
    })

    return attachments[0] ? this.buildAttachment(attachments[0]) : null
  }

  async findMany() {
    if (!this.options.multiple) {
      throw new UploError('Use findOne for single attachment')
    }

    const results = await this.adapter.findAttachments({
      recordId: this.modelId,
      recordType: this.recordType,
      name: this.attachmentName,
    })

    return results.map((result) => this.buildAttachment(result))
  }

  async detach(attachmentId?: ID) {
    if (this.options.multiple) {
      if (!attachmentId) {
        throw new UploError('Provide attachment ID when detaching attachment in multiple')
      }
      const deleted = await this.adapter.deleteAttachment({
        id: attachmentId,
        recordId: this.modelId,
        recordType: this.recordType,
        name: this.attachmentName,
      })

      if (!deleted) {
        throw new AttachmentNotFoundError(
          `Cannot find attachment with ID ${attachmentId} for ${this.recordType} ${this.modelId} ${this.attachmentName}`,
        )
      }

      return true
    }

    await this.detachMany()

    return true
  }

  async detachMany() {
    await this.adapter.deleteAttachments({
      recordId: this.modelId,
      recordType: this.recordType,
      name: this.attachmentName,
    })

    return true
  }

  async attachFile(input: BlobInput) {
    const blobParams = {
      key: await buildBlobKey({
        service: this.getService(this.options.serviceName),
        storagePath: this.options.storagePath,
        serviceName: this.options.serviceName,
        modelName: this.modelName,
        attachmentName: this.attachmentName,
        fileName: input.fileName,
        contentType: input.contentType,
      }),
      fileName: input.fileName,
      contentType: input.contentType,
      size: input.size,
      checksum: input.checksum,
      metadata: {},
    }

    validateBlobInputData(blobParams, this.options.validate)

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
    })

    await this.getService(blob.serviceName).upload({
      content: input.content,
      ...blob,
    })

    const updateMetadataFn = this.getService(blob.serviceName).updateMetadata

    if (updateMetadataFn) {
      await updateMetadataFn(blob.key, {
        contentType: blob.contentType,
      })
    }

    const result = await this.attachBlob(blob)

    return result
  }

  async attachSignedFile(signedId: string) {
    const name = `${this.modelName}.${this.attachmentName}`

    if (this.options.directUpload === false) {
      throw new DirectUploadDisabledError(`Direct upload is disabled for attachment "${name}"`)
    }

    const data = await this.signer.verify(signedId, 'blob')
    if (!data || !data.blobId) {
      throw new UploError(`Cannot verify signed ID for blob: ${signedId}`)
    }
    const { blobId } = data

    // Signed ID must be created for this attachment, otherwise a file uploaded
    // for one attachment could skip validation of another
    if (data.modelName !== this.modelName || data.attachmentName !== this.attachmentName) {
      throw new InvalidSignedIdError(`Signed ID was not created for attachment "${name}"`)
    }

    if (this.callbacks.beforeAttach) {
      await this.callbacks.beforeAttach({ blobId })
    }

    const blob = await this.adapter.findBlob(blobId)

    if (!blob) {
      throw new BlobNotFoundError(`Cannot find blob with ID ${blobId}`)
    }

    // A signed ID is attached once. Sending it again for the same record and
    // attachment (e.g. form saved twice) returns the existing attachment, any
    // other record is refused, so a leaked signed ID cannot be reused
    const existing = await this.adapter.findBlobAttachments(blob.id)
    if (existing.length > 0) {
      const sameRecord = existing.find(
        (attachment) =>
          attachment.recordType === this.recordType &&
          String(attachment.recordId) === String(this.modelId) &&
          attachment.name === this.attachmentName,
      )

      if (!sameRecord) {
        throw new BlobAlreadyAttachedError(`Signed ID was already attached to another record`)
      }

      return this.buildAttachment({ ...sameRecord, blob })
    }

    const service = this.getService(blob.serviceName)

    // The client uploads straight to storage, so check the file is there with
    // the declared size and content type before attaching it
    await verifyUploadedObject(service, blob)

    const updateMetadataFn = service.updateMetadata

    if (updateMetadataFn) {
      await updateMetadataFn(blob.key, {
        contentType: blob.contentType,
      })
    }

    const result = await this.attachBlob(blob)

    return result
  }

  private async attachBlob(blob: BlobData) {
    const result = await this.adapter.attachBlob({
      blob,
      attachmentName: this.attachmentName,
      recordId: this.modelId,
      recordType: this.recordType,
      append: this.options.multiple,
    })

    const attachment = this.buildAttachment(result)

    if (this.callbacks.afterAttach) {
      await this.callbacks.afterAttach({ blob: attachment.blob })
    }

    return attachment
  }

  private buildAttachment(data: AttachmentData) {
    return Attachment({ data, adapter: this.adapter, services: this.services })
  }

  private getService(serviceName: string) {
    const service = this.services[serviceName]

    if (!service) {
      throw new UploError(`Cannot find service with name ${serviceName}`)
    }

    return service
  }
}
