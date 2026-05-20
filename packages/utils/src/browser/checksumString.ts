export const checksumString = async (content: string | Uint8Array) => {
  const data =
    typeof content === 'string' ? new TextEncoder().encode(content) : new Uint8Array(content)

  const hashBuffer = await crypto.subtle.digest('MD5', data)
  const digest = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))

  return digest
}
