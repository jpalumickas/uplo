function dec2hex (dec: any) {
  return dec.toString(16).padStart(2, "0")
}

export const generateKey = async (size: number = 32) => {
  const arr = new Uint8Array((size || 40) / 2)
  globalThis.crypto.getRandomValues(arr)
  return Array.from(arr, dec2hex).join('')
}
