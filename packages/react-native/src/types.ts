export type UploadID = string | number;
export type Metadata = {
  [key: string]: string | number | boolean;
}

export interface File {
  id?: string;
  localUri?: string;
  uri: string;
  fileName?: string;
  contentType?: string;
  width?: number;
  height?: number;
  metadata?: Metadata;
}

export interface Upload {
  id: string;
  file: File;
  signedId: null | string;
  uploading: boolean;
  error?: string | any;
}

export interface UseUploadOptions {
  multiple?: boolean;
  onUploadAdd?: (upload: Upload) => void
  onUploadChange?: (upload: Upload) => void
  onUploadSuccess?: (upload: Upload) => void
}
