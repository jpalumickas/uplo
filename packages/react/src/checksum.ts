import SparkMD5 from 'spark-md5';

const chunkSize = 2097152; // 2MB

export const checksum = async (file: File) => {
  return new Promise((resolve, reject) => {
    const chunkCount = Math.ceil(file.size / chunkSize);
    let chunkIndex = 0;
    const md5buffer = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    const readNextChunk = () => {
      if (chunkIndex < chunkCount || (chunkIndex == 0 && chunkCount == 0)) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const bytes = file.slice(start, end);
        fileReader.readAsArrayBuffer(bytes);
        chunkIndex++;
        return true;
      } else {
        return false;
      }
    };

    fileReader.addEventListener('load', (event) => {
      if (!event.target?.result) return;

      md5buffer.append(event.target.result as ArrayBuffer);

      if (!readNextChunk()) {
        const binaryDigest = md5buffer.end(true);
        const base64digest = btoa(binaryDigest);
        resolve(base64digest);
      }
    });

    fileReader.addEventListener('error', (event) => {
      reject(event);
    });


    readNextChunk();
  });
};
