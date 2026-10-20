import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { describe, it, expect } from 'vitest'

import type { Blob } from '@uplo/types'

import { downloadToTempfile } from '../src/downloadToTempfile'
import { tempFile, tempFileName } from '../src/utils/tempFile'

const tmpDir = () => fs.realpath(os.tmpdir())

describe('tempFileName', () => {
  it.each([
    ['photo.PNG', 'file.png'],
    ['archive.tar.gz', 'file.gz'],
    ['../../etc/passwd', 'file'],
    ['../../../home/app/.bashrc', 'file'],
    ['..\\..\\evil.exe', 'file.exe'],
    ['/abs/path/image.jpg', 'file.jpg'],
    ['photo.p/ng', 'file'],
    ['photo.png%00.sh', 'file.sh'],
    ['name.', 'file'],
    ['.env', 'file'],
    ['', 'file'],
  ])('"%s" -> "%s"', (input, expected) => {
    expect(tempFileName(input)).toEqual(expected)
  })
})

describe('tempFile', () => {
  it('creates file path inside its own temp directory', async () => {
    const root = await tmpDir()
    let filePath = ''

    await tempFile(
      async (p) => {
        filePath = p
      },
      { fileName: '../../escape.txt' },
    )

    expect(path.dirname(path.dirname(filePath))).toEqual(root)
    expect(path.basename(filePath)).toEqual('file.txt')
  })

  it('removes temp directory when callback throws', async () => {
    let filePath = ''

    await expect(
      tempFile(
        async (p) => {
          filePath = p
          await fs.writeFile(p, 'data')
          throw new Error('analyze failed')
        },
        { fileName: 'photo.png' },
      ),
    ).rejects.toThrow('analyze failed')

    expect(existsSync(path.dirname(filePath))).toBe(false)
  })
})

describe('downloadToTempfile', () => {
  it('does not write outside temp directory for unsafe file names', async () => {
    const escaped = path.join(await tmpDir(), 'uplo-test-escape.txt')
    await fs.rm(escaped, { force: true })

    const blob = {
      key: 'key',
      fileName: '../uplo-test-escape.txt',
      service: { createReadStream: async () => Readable.from(['content']) },
    } as unknown as Blob

    let content = ''
    await downloadToTempfile({ blob }, async (p) => {
      content = await fs.readFile(p, 'utf8')
    })

    expect(content).toEqual('content')
    expect(existsSync(escaped)).toBe(false)
  })
})
