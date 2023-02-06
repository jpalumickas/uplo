// export interface File {
//   id?: string;
//   name: string;
//   type: string;
//   size: number;
//   width?: number;
//   height?: number;
//   metadata?: {
//     [key: string]: string | number;
//   };
// }

export type UploadID = string | number;
export type Metadata = {
  [key: string]: string | number | boolean;
}

export interface Upload {
  id: UploadID;
  file: File;
  signedId: null | string;
  uploading: boolean;
  progress: number
  error?: string | any;
}

export interface UploadFileOptions {
  id?: UploadID;
  file: File;
  metadata?: Metadata;
}

export interface UseDirectUploadOptions {
  multiple?: boolean;
  onUploadAdd?: (upload: Upload) => void
  onUploadChange?: (upload: Upload) => void
  onUploadSuccess?: (upload: Upload) => void
}
