import type { Service, Adapter } from '@uplo/types';
import type { Callbacks } from './callbacks';

export interface UploConfig {
  privateKey?: string;
  signedIdExpiresIn?: number;
}

type AttachmentValidateObjectType = {
  /** File content type */
  contentType?: string | string[] | RegExp | RegExp[];
  /** File size in bytes */
  size?: {
    /** Minimum file size in bytes */
    min?: number;
    /** Maximum file size in bytes */
    max?: number;
  };
};

export type AttachmentValidateType = AttachmentValidateObjectType;

export interface UploOptionsAttachment {
  multiple?: boolean;
  serviceName?: string;
  /** Support direct upload to service with Signed URL */
  directUpload?: boolean;
  validate?: AttachmentValidateType;
}

export type UploOptionsAttachments = Partial<
  Record<string, Record<string, UploOptionsAttachment | true>>
>;

export interface UploOptions<
  AttachmentsList extends UploOptionsAttachments = {},
> {
  services: {
    [serviceName: string]: Service;
  };
  defaultServiceName?: string;
  adapter: Adapter;
  config?: UploConfig;
  callbacks?: Callbacks;
  attachments: AttachmentsList;
}
