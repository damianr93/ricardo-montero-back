import { describe, it, expect } from 'vitest'
import { RegisterUserDto } from './register.user.dto'

const validInput = {
  name: 'Juan',
  email: 'juan@example.com',
  password: 'secret1',
  razonSocial: 'ACME SA',
  CUIT: '20304050607',
  phone: '353-1234567',
  direccion: 'Calle 1',
  localidad: 'Villa María',
  provincia: 'Córdoba',
  codigoPostal: 5900,
}

describe('RegisterUserDto.create — all fields required', () => {
  it('requires name', () => {
    expect(RegisterUserDto.create({ ...validInput, name: undefined })[0]).toBe('Missing name')
  })

  it('requires email', () => {
    expect(RegisterUserDto.create({ ...validInput, email: undefined })[0]).toBe('Missing email')
  })

  it('rejects an invalid email', () => {
    expect(RegisterUserDto.create({ ...validInput, email: 'nope' })[0]).toBe('email is not valid')
  })

  it('requires password', () => {
    expect(RegisterUserDto.create({ ...validInput, password: undefined })[0]).toBe('Missing password')
  })

  it('rejects a password shorter than 6 characters', () => {
    expect(RegisterUserDto.create({ ...validInput, password: '123' })[0]).toBe('Password to short')
  })

  it('requires razonSocial', () => {
    expect(RegisterUserDto.create({ ...validInput, razonSocial: undefined })[0]).toBe('Missing razonSocial')
  })

  it('requires CUIT', () => {
    expect(RegisterUserDto.create({ ...validInput, CUIT: undefined })[0]).toBe('Missing CUIT')
  })

  it('rejects a CUIT that is not 11 digits', () => {
    expect(RegisterUserDto.create({ ...validInput, CUIT: '123' })[0]).toBe('CUIT must be 11 digits')
  })

  it('requires phone', () => {
    expect(RegisterUserDto.create({ ...validInput, phone: undefined })[0]).toBe('Missing phone')
  })

  it('requires direccion', () => {
    expect(RegisterUserDto.create({ ...validInput, direccion: undefined })[0]).toBe('Missing direccion')
  })

  it('requires localidad', () => {
    expect(RegisterUserDto.create({ ...validInput, localidad: undefined })[0]).toBe('Missing localidad')
  })

  it('requires provincia', () => {
    expect(RegisterUserDto.create({ ...validInput, provincia: undefined })[0]).toBe('Missing provincia')
  })

  it('requires codigoPostal', () => {
    expect(RegisterUserDto.create({ ...validInput, codigoPostal: undefined })[0]).toBe('Missing codigoPostal')
  })

  it('rejects a non-positive postal code', () => {
    expect(RegisterUserDto.create({ ...validInput, codigoPostal: -1 })[0]).toBe('Invalid postal code')
  })

  it('builds a dto when every field is present and valid', () => {
    const [error, dto] = RegisterUserDto.create(validInput)
    expect(error).toBeUndefined()
    expect(dto).toBeInstanceOf(RegisterUserDto)
    expect(dto?.name).toBe('Juan')
    expect(dto?.razonSocial).toBe('ACME SA')
    expect(dto?.CUIT).toBe('20304050607')
    expect(dto?.phone).toBe('353-1234567')
    expect(dto?.codigoPostal).toBe(5900)
  })
})
