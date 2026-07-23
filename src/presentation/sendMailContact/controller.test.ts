import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SendOrderController } from './controller'

// Minimal Express response double that records the last status/body.
const makeRes = () => {
  const res: any = {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
  }
  return res
}

const items = [
  { product: { title: 'Rosa', price: 300 }, quantity: 2 }, // 600
  { product: { title: 'Maceta', price: 200 }, quantity: 1 }, // 200
] // computedTotal = 800

const baseBody = { name: 'Ana', phone: '3530000000', items, total: 800 }

describe('SendOrderController.sendOrder — minimum order enforcement', () => {
  let emailService: { sendEmail: ReturnType<typeof vi.fn> }
  let settingService: { getSettings: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    emailService = { sendEmail: vi.fn().mockResolvedValue(undefined) }
    settingService = { getSettings: vi.fn().mockResolvedValue({ minOrderAmount: 0 }) }
  })

  const build = () =>
    new SendOrderController(emailService as any, settingService as any)

  it('rejects an order below the configured minimum without sending email', async () => {
    settingService.getSettings.mockResolvedValue({ minOrderAmount: 1000 })
    const res = makeRes()

    await build().sendOrder({ body: baseBody } as any, res, vi.fn() as any)

    expect(res.statusCode).toBe(400)
    expect(res.body.error).toContain('mínimo')
    expect(emailService.sendEmail).not.toHaveBeenCalled()
  })

  it('accepts an order that meets the minimum and sends the email', async () => {
    settingService.getSettings.mockResolvedValue({ minOrderAmount: 800 })
    const res = makeRes()

    await build().sendOrder({ body: baseBody } as any, res, vi.fn() as any)

    expect(res.body).toEqual({ success: true })
    expect(emailService.sendEmail).toHaveBeenCalledOnce()
  })

  it('ignores the client-provided total and recomputes from items', async () => {
    // Client lies about the total, but real items only add up to 800 < 1000.
    settingService.getSettings.mockResolvedValue({ minOrderAmount: 1000 })
    const res = makeRes()

    await build().sendOrder(
      { body: { ...baseBody, total: 999999 } } as any,
      res,
      vi.fn() as any
    )

    expect(res.statusCode).toBe(400)
    expect(emailService.sendEmail).not.toHaveBeenCalled()
  })

  it('allows any total when the minimum is disabled (0)', async () => {
    settingService.getSettings.mockResolvedValue({ minOrderAmount: 0 })
    const res = makeRes()

    await build().sendOrder(
      { body: { ...baseBody, total: 1 } } as any,
      res,
      vi.fn() as any
    )

    expect(res.body).toEqual({ success: true })
    expect(emailService.sendEmail).toHaveBeenCalledOnce()
  })

  it('rejects a malformed payload with 400', async () => {
    const res = makeRes()

    await build().sendOrder(
      { body: { name: 'Ana', phone: '353', items: 'nope', total: 'x' } } as any,
      res,
      vi.fn() as any
    )

    expect(res.statusCode).toBe(400)
    expect(emailService.sendEmail).not.toHaveBeenCalled()
  })
})
