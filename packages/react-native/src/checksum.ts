import { btoa } from 'abab';

const checksum = async (md5: string) => {
  const hexArray = md5
    .replace(/\r|\n/g, '')
    .replace(/([\da-fA-F]{2}) ?/g, '0x$1 ')
    .replace(/ +$/, '')
    .split(' ')
    .map(str => Number(str));

  const byteString = String.fromCharCode.apply(null, hexArray);

  return btoa(byteString);
};

export default checksum;
