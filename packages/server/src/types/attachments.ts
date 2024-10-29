import { AttachmentValidateType } from './config';

export interface FormattedAttachmentOptions {
  multiple: boolean;
  serviceName: string;
  directUpload: boolean;
  validate?: AttachmentValidateType;
}
