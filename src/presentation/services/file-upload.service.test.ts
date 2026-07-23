import { describe, it, expect, vi } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { FileUploadService } from './file-upload.service'

const makeTempFile = () => {
  const tmp = path.join(os.tmpdir(), `upl-test-${Date.now()}-${Math.random().toString(36).slice(2)}.png`)
  fs.writeFileSync(tmp, Buffer.from('fake-image-bytes'))
  return tmp
}

describe('FileUploadService.uploadSingle', () => {
  it('streams the temp file to S3 with the right content length and removes it', async () => {
    const tmp = makeTempFile()
    const uploadStream = vi.fn().mockResolvedValue(undefined)
    const service = new FileUploadService(() => 'fixed-id', { uploadStream } as any)

    const file: any = {
      mimetype: 'image/png',
      size: fs.statSync(tmp).size,
      tempFilePath: tmp,
      data: Buffer.alloc(0),
    }

    const result = await service.uploadSingle(file, 'uploads/products')

    expect(uploadStream).toHaveBeenCalledOnce()
    const [key, , contentType, contentLength] = uploadStream.mock.calls[0]
    expect(key).toContain('uploads/products/')
    expect(contentType).toBe('image/png')
    expect(contentLength).toBe(file.size)
    expect(result.fileName).toContain('uploads/products/')
    expect(fs.existsSync(tmp)).toBe(false) // temp file cleaned up
  })

  it('falls back to a buffer upload when there is no temp file', async () => {
    const uploadBuffer = vi.fn().mockResolvedValue(undefined)
    const uploadStream = vi.fn()
    const service = new FileUploadService(() => 'id', { uploadBuffer, uploadStream } as any)

    const file: any = {
      mimetype: 'image/jpeg',
      size: 4,
      tempFilePath: undefined,
      data: Buffer.from('data'),
    }

    await service.uploadSingle(file, 'uploads/users')

    expect(uploadBuffer).toHaveBeenCalledOnce()
    expect(uploadStream).not.toHaveBeenCalled()
  })

  it('rejects an invalid extension before touching S3', async () => {
    const uploadStream = vi.fn()
    const service = new FileUploadService(() => 'id', { uploadStream } as any)

    const file: any = { mimetype: 'application/pdf', size: 10, tempFilePath: '/nope', data: Buffer.alloc(0) }

    await expect(service.uploadSingle(file)).rejects.toThrow()
    expect(uploadStream).not.toHaveBeenCalled()
  })
})
