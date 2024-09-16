import { useState, useMemo, useCallback } from 'react';
import { createBlob } from '../services/createBlob';
import { uploadAsync } from '../services/uploadAsync';
import {
  UploadID,
  Upload,
  UploadFileOptions,
  UseDirectUploadOptions,
} from '../types';
import { useUploConfig } from './useUploConfig';

export const useDirectUpload = (
  attachmentName: string,
  {
    multiple = false,
    onUploadAdd,
    onUploadChange,
    onUploadSuccess,
  }: UseDirectUploadOptions = {}
) => {
  const { host, mountPath } = useUploConfig();

  const [uploads, setUploads] = useState<Upload[]>([]);

  const addUpload = useCallback(
    (upload: Upload) => {
      setUploads((prev) => (multiple ? [...prev, upload] : [upload]));
      if (onUploadAdd) {
        onUploadAdd(upload);
      }
    },
    [multiple, onUploadAdd]
  );

  const clear = useCallback(() => setUploads([]), []);
  const uploading = useMemo(
    () => uploads.some((it) => it.uploading === true),
    [uploads]
  );
  const signedIds = useMemo(
    () => uploads.map((upload) => upload.signedId).filter((id) => id),
    [uploads]
  );
  const error = useMemo(() => uploads.find((it) => it.error)?.error, [uploads]);

  const updateUpload = useCallback(
    (id: UploadID, upload: Partial<Upload>) => {
      setUploads((prev) => {
        return prev.map((item) => {
          if (item.id !== id) return item;
          const updatedUpload = { ...item, ...upload };

          if (onUploadChange) {
            onUploadChange(updatedUpload);
          }
          return updatedUpload;
        });
      });
    },
    [onUploadChange]
  );

  const uploadFile = useCallback(
    async ({ file, id: providedId, metadata }: UploadFileOptions) => {
      const id = providedId || Date.now().toString();

      let upload: Upload = {
        id,
        file,
        uploading: true,
        progress: 0,
        signedId: null,
      };

      addUpload(upload);

      try {
        const result = await createBlob(
          attachmentName,
          { file, metadata },
          { host, mountPath }
        );
        if (result.error) {
          upload.error = result.error;
          updateUpload(id, { error: upload.error });
          return upload;
        }

        const { status } = await uploadAsync({
          url: result.data.upload.url,
          headers: result.data.upload.headers,
          file,
          onProgress: ({ percent }) => {
            upload.progress = percent;
            updateUpload(id, { progress: percent });
          },
        });

        if (status >= 200 && status < 300) {
          upload.signedId = result.data.signedId;
          updateUpload(id, { signedId: result.data.signedId });
        } else {
          upload.error = 'Failed to upload file';
          updateUpload(id, { error: upload.error });
        }

        upload.uploading = false;
        upload.progress = 100;
        updateUpload(id, { uploading: false, progress: 100 });
        if (onUploadSuccess) {
          onUploadSuccess(upload);
        }
      } catch (err) {
        upload.uploading = false;

        if (err instanceof Error) {
          upload.error = err.message;
        } else if (typeof err === 'string') {
          upload.error = err;
        }

        updateUpload(id, { uploading: false, error: err });
      }

      return upload;
    },
    [addUpload, onUploadSuccess, updateUpload]
  );

  return {
    uploadFile,
    uploads,
    uploading,
    signedIds,
    error,
    clear,
  };
};
