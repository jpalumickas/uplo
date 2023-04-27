import { describe, it, expect } from 'vitest'
import { checksumString } from '../src/checksumString'

describe('checksumString', () => {
  it('returns correct checksum', async () => {
    const checksum = await checksumString('test')
    expect(checksum).toEqual('CY9rzUYh03PK3k6DJie09g==')
  })
})
