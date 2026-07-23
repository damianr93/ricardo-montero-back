import { regularExps } from "../../../config";

export class RegisterUserDto {
  private constructor(
    public name: string,
    public email: string,
    public password: string,
    public razonSocial: string,
    public CUIT: string,
    public phone: string,
    public direccion: string,
    public localidad: string,
    public provincia: string,
    public codigoPostal: number
  ) {}

  static create(object: { [key: string]: any }): [string?, RegisterUserDto?] {
    const {
      name,
      email,
      password,
      razonSocial,
      CUIT,
      phone,
      direccion,
      localidad,
      provincia,
      codigoPostal,
    } = object;

    // Todos los campos son obligatorios
    if (!name) return ["Missing name"];
    if (!email) return ["Missing email"];
    if (!regularExps.email.test(email)) return ["email is not valid"];
    if (!password) return ["Missing password"];
    if (password.length < 6) return ["Password to short"];
    if (!razonSocial) return ["Missing razonSocial"];
    if (!CUIT) return ["Missing CUIT"];
    if (!/^\d{11}$/.test(CUIT)) return ["CUIT must be 11 digits"];
    if (!phone) return ["Missing phone"];
    if (!direccion) return ["Missing direccion"];
    if (!localidad) return ["Missing localidad"];
    if (!provincia) return ["Missing provincia"];
    if (codigoPostal === undefined || codigoPostal === null || codigoPostal === "")
      return ["Missing codigoPostal"];
    if (typeof codigoPostal !== "number" || codigoPostal <= 0)
      return ["Invalid postal code"];

    return [
      undefined,
      new RegisterUserDto(
        name,
        email,
        password,
        razonSocial,
        CUIT,
        phone,
        direccion,
        localidad,
        provincia,
        codigoPostal
      ),
    ];
  }
}
