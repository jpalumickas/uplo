import { UploError } from '../errors'

/** Seconds, or a string like `'30s'`, `'15m'`, `'12h'`, `'1d'` */
export type Duration = number | `${number}${'s' | 'm' | 'h' | 'd'}`

const units = { s: 1, m: 60, h: 60 * 60, d: 24 * 60 * 60 }

/** Returns the duration in milliseconds */
export const parseDuration = (duration: Duration): number => {
  if (typeof duration === 'number') {
    if (!Number.isFinite(duration) || duration < 0) {
      throw new UploError(`Invalid duration: ${duration}`)
    }
    return duration * 1000
  }

  const match = /^(\d+(?:\.\d+)?)([smhd])$/.exec(duration)
  if (!match) {
    throw new UploError(`Invalid duration: ${duration}`)
  }

  return Number(match[1]) * units[match[2] as keyof typeof units] * 1000
}
