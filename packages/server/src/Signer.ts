import type { JWTPayload } from 'jose'
import { jwtVerify, SignJWT } from 'jose'

import type { ID } from '@uplo/types'

import { SignerError } from './errors'
import type { UploConfig } from './types'

const ISSUER = 'uplo'

export type SignerBlobData = {
  blobId: ID
  /** Model name from attachments config (e.g. `user`) */
  modelName: string
  /** Attachment name from attachments config (e.g. `avatar`) */
  attachmentName: string
}
export type SignerData = SignerBlobData

export type SignerPurpose = 'blob'

// HS256 keys shorter than the hash can be guessed offline from any signed ID
export const MIN_PRIVATE_KEY_BYTES = 32

const MISSING_KEY_MESSAGE =
  'Missing `privateKey` in Uplo config. It is required for direct uploads.'

export const Signer = (config: UploConfig) => {
  const secret = config.privateKey ? new TextEncoder().encode(config.privateKey) : undefined

  if (secret && secret.byteLength < MIN_PRIVATE_KEY_BYTES) {
    throw new SignerError(
      `\`privateKey\` must be at least ${MIN_PRIVATE_KEY_BYTES} bytes, got ${secret.byteLength}. Generate one with \`openssl rand -base64 32\`.`,
    )
  }

  async function generate(data: SignerBlobData, purpose: 'blob'): Promise<string>
  async function generate(data: SignerData, purpose: SignerPurpose): Promise<string> {
    if (!secret) {
      throw new SignerError(MISSING_KEY_MESSAGE)
    }

    const token = await new SignJWT(data as JWTPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(ISSUER)
      .setAudience(purpose)
      // Relative time in seconds, jose adds it to the current time
      .setExpirationTime(`${config.signedIdExpiresIn || 3600}s`)
      .sign(secret)

    if (!token) {
      throw new SignerError('Failed to generate signed token')
    }

    return token
  }

  const verify = async (token: string, purpose: SignerPurpose) => {
    if (!secret) {
      throw new SignerError(MISSING_KEY_MESSAGE)
    }

    // Fields can be missing in tokens signed by older versions
    const { payload } = await jwtVerify<Partial<SignerData>>(token, secret, {
      issuer: ISSUER,
      audience: purpose,
    })

    return payload
  }

  return {
    generate,
    verify,
  }
}
