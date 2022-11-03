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
  [key: string]: string | number;
}

export interface Upload {
  id: UploadID;
  file: File;
  signedId: null | string;
  uploading: boolean;
  error?: string | any;
}

export interface UploadFileOptions {
  id?: UploadID;
  file: File;
  metadata?: Metadata;
}

export interface UseUploadOptions {
  multiple?: boolean;
}
