import { useState, useMemo, useCallback } from 'react';
import { uploadAsync } from 'expo-file-system';
import { createBlob } from '../createBlob';
import { Upload, File, UseUploadOptions } from '../types';

import { useUploConfig } from './useUploConfig';

const getRandomId = () => `${Date.now()}${Math.floor(Math.random() * 100000)}`;

export const useDirectUpload = (
  attachmentName: string,
  {
    multiple = false,
    onUploadAdd,
    onUploadChange,
    onUploadSuccess,
  }: UseUploadOptions = {}
) => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const { host, mountPath } = useUploConfig();

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
    (id: string, upload: Partial<Upload>) => {
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
    async (file: File) => {
      const id = file.id || getRandomId();

      let upload: Upload = {
        id,
        file,
        uploading: true,
        signedId: null,
      };

      addUpload(upload);

      try {
        const result = await createBlob(attachmentName, file, {
          host,
          mountPath,
        });
        if (result.error) {
          upload.error = result.error;
          updateUpload(id, { error: upload.error });
          return upload;
        }

        const { status } = await uploadAsync(
          result.data.upload.url,
          file.localUri || file.uri,
          {
            headers: result.data.upload.headers,
            httpMethod: 'PUT',
          }
        );

        if (status >= 200 && status < 300) {
          upload.signedId = result.data.signedId;
          updateUpload(id, { signedId: result.data.signedId });
        } else {
          upload.error = 'Failed to upload file';
          updateUpload(id, { error: upload.error });
        }

        upload.uploading = false;
        updateUpload(id, { uploading: false });
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
