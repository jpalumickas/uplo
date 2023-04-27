export const checksumString = async (content: string) => {
  const msgUint8 = new TextEncoder().encode(content); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest('MD5', msgUint8); // hash the message
  // const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  // // const hashHex = hashArray
  //   .map((b) => b.toString(16).padStart(2, '0'))
  //   .join('');

const digest = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

  return digest;
};
