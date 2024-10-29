import type { Service, Adapter } from '@uplo/types';
import type { Callbacks } from './callbacks';

export interface UploConfig {
  privateKey?: string;
  signedIdExpiresIn?: number;
}

type AttachmentValidateObjectType = {
  contentType?: string | string[] | RegExp | RegExp[];
};

export type AttachmentValidateType = AttachmentValidateObjectType;

export interface UploOptionsAttachment {
  multiple?: boolean;
  serviceName?: string;
  directUpload?: boolean;
  validate?: AttachmentValidateType;
}

export type UploOptionsAttachments = Partial<
  Record<string, Record<string, UploOptionsAttachment | true>>
>;

export interface UploOptions<AttachmentsList extends UploOptionsAttachments> {
  services: {
    [serviceName: string]: Service;
  };
  defaultServiceName?: string;
  adapter: Adapter;
  config?: UploConfig;
  callbacks?: Callbacks;
  attachments: AttachmentsList;
}
