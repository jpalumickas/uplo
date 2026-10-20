import type { Options } from '../types'

export const buildR2Endpoint = ({
  accountId,
  jurisdiction,
}: Pick<Options, 'accountId' | 'jurisdiction'>) =>
  `https://${accountId}${jurisdiction ? `.${jurisdiction}` : ''}.r2.cloudflarestorage.com`
