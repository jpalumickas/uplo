export interface File {
  id?: string;
  localUri?: string;
  uri: string;
  fileName?: string;
  contentType?: string;
  width?: number;
  height?: number;
  metadata?: {
    [key: string]: string | number;
  };
}

export interface Upload {
  id: string;
  file: File;
  signedId: null | string;
  uploading: boolean;
  error?: string;
}

export interface UseUploadOptions {
  multiple?: boolean;
}
