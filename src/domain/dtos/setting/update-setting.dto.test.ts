import { describe, it, expect } from 'vitest'
import { UpdateSettingDto } from './update-setting.dto'

describe('UpdateSettingDto.update', () => {
  it('requires minOrderAmount', () => {
    const [error] = UpdateSettingDto.update({})
    expect(error).toBe('Missing minOrderAmount')
  })

  it('rejects a non-numeric value', () => {
    const [error] = UpdateSettingDto.update({ minOrderAmount: 'abc' })
    expect(error).toBe('minOrderAmount must be a number')
  })

  it('rejects a negative value', () => {
    const [error] = UpdateSettingDto.update({ minOrderAmount: -1 })
    expect(error).toBe('minOrderAmount cannot be negative')
  })

  it('accepts zero (minimum disabled)', () => {
    const [error, dto] = UpdateSettingDto.update({ minOrderAmount: 0 })
    expect(error).toBeUndefined()
    expect(dto?.minOrderAmount).toBe(0)
  })

  it('accepts a positive number', () => {
    const [error, dto] = UpdateSettingDto.update({ minOrderAmount: 1500 })
    expect(error).toBeUndefined()
    expect(dto?.minOrderAmount).toBe(1500)
  })

  it('coerces a numeric string', () => {
    const [error, dto] = UpdateSettingDto.update({ minOrderAmount: '1500' })
    expect(error).toBeUndefined()
    expect(dto?.minOrderAmount).toBe(1500)
  })
})
