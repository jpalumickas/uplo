export interface File {
  id?: string;
  localUri?: string;
  uri: string;
  filename?: string;
  type?: string;
  width?: number;
  height?: number;
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
