import { describe, it, expect } from 'vitest'
import { RegisterUserDto } from './register.user.dto'

const validInput = {
  name: 'Juan',
  email: 'juan@example.com',
  password: 'secret1',
}

describe('RegisterUserDto.create', () => {
  it('requires name', () => {
    const [error] = RegisterUserDto.create({ ...validInput, name: undefined })
    expect(error).toBe('Missing name')
  })

  it('requires email', () => {
    const [error] = RegisterUserDto.create({ ...validInput, email: undefined })
    expect(error).toBe('Missing email')
  })

  it('rejects an invalid email', () => {
    const [error] = RegisterUserDto.create({ ...validInput, email: 'not-an-email' })
    expect(error).toBe('email is not valid')
  })

  it('requires password', () => {
    const [error] = RegisterUserDto.create({ ...validInput, password: undefined })
    expect(error).toBe('Missing password')
  })

  it('rejects a password shorter than 6 characters', () => {
    const [error] = RegisterUserDto.create({ ...validInput, password: '123' })
    expect(error).toBe('Password to short')
  })

  it('rejects a CUIT that is not 11 digits', () => {
    const [error] = RegisterUserDto.create({ ...validInput, CUIT: '123' })
    expect(error).toBe('CUIT must be 11 digits')
  })

  it('accepts an 11-digit CUIT', () => {
    const [error, dto] = RegisterUserDto.create({ ...validInput, CUIT: '20304050607' })
    expect(error).toBeUndefined()
    expect(dto?.CUIT).toBe('20304050607')
  })

  it('rejects a non-positive postal code', () => {
    const [error] = RegisterUserDto.create({ ...validInput, codigoPostal: 0 - 1 })
    expect(error).toBe('Invalid postal code')
  })

  it('builds a dto with only the required fields', () => {
    const [error, dto] = RegisterUserDto.create(validInput)
    expect(error).toBeUndefined()
    expect(dto).toBeInstanceOf(RegisterUserDto)
    expect(dto?.name).toBe('Juan')
    expect(dto?.email).toBe('juan@example.com')
    expect(dto?.password).toBe('secret1')
  })

  it('carries optional fields when provided', () => {
    const [, dto] = RegisterUserDto.create({
      ...validInput,
      razonSocial: 'ACME',
      phone: '353-1234567',
      codigoPostal: 5900,
    })
    expect(dto?.razonSocial).toBe('ACME')
    expect(dto?.phone).toBe('353-1234567')
    expect(dto?.codigoPostal).toBe(5900)
  })
})
