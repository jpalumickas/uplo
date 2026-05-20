import { md5 } from '@noble/hashes/legacy.js'

const CHUNK_SIZE = 2_097_152 // 2 MB

export const checksumFromFile = async (file: File): Promise<string> => {
  const hash = md5.create()

  for (let start = 0; start < file.size; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)
    const buffer = await chunk.arrayBuffer()
    hash.update(new Uint8Array(buffer))
  }

  const digest = hash.digest()
  let binary = ''
  for (let i = 0; i < digest.length; i++) {
    binary += String.fromCharCode(digest[i])
  }
  return btoa(binary)
}
