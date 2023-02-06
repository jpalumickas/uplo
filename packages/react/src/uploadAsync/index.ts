type Result = {
  status: number;
  response: any;
};

export const uploadAsync = async ({
  url,
  headers,
  file,
  onProgress,
}: {
  url: string;
  headers: Record<string, string>;
  file: File;
  onProgress?: (data: {
    loaded: number;
    total: number;
    percent: number;
  }) => void;
}) => {
  return new Promise<Result>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.responseType = 'text';

    for (const key in headers) {
      xhr.setRequestHeader(key, headers[key]);
    }

    xhr.addEventListener('load', (event) => {
      const { status, response } = xhr;
      if (status >= 200 && status < 300) {
        resolve({ status, response });
      } else {
        reject({ error: event });
      }
    });

    xhr.addEventListener('error', (event) => reject(event));
    xhr.upload.addEventListener('progress', (event) => {
      if (onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percent: Math.ceil((event.loaded * 100) / event.total),
        });
      }
    });

    xhr.send(file.slice());
  });
};
