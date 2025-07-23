import { regularExps } from "../../../config";

export class RegisterUserDto {
  private constructor(
    public name: string,
    public email: string,
    public password: string,
    public razonSocial?: string,
    public CUIT?: string,
    public phone?: string,
    public direccion?: string,
    public localidad?: string,
    public provincia?: string,
    public codigoPostal?: number
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

    // Validaciones obligatorias
    if (!name) return ["Missing name"];
    if (!email) return ["Missing email"];
    if (!regularExps.email.test(email)) return ["email is not valid"];
    if (!password) return ["Missing password"];
    if (password.length < 6) return ["Password to short"];

    // Validaciones opcionales (si vienen, que sean válidas)
    if (CUIT && !/^\d{11}$/.test(CUIT)) return ["CUIT must be 11 digits"];
    if (
      codigoPostal &&
      (typeof codigoPostal !== "number" || codigoPostal <= 0)
    ) {
      return ["Invalid postal code"];
    }

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
