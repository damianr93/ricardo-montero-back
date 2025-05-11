import { regularExps } from "../../config/regular-exp";

export class ContactFormDto {
  private constructor(
    public name: string,
    public email: string,
    public localidad: string | undefined,
    public phone: string,
    public empresa: string | undefined,
    public actividad: string | undefined,
    public cotizar: string[],
    public message: string
  ) {}

  static create(
    object: Record<string, any>
  ): [string | undefined, ContactFormDto?] {
    const {
      name,
      email,
      localidad,
      phone,
      empresa,
      actividad,
      cotizar,
      message,
    } = object;

    if (!name) return ['Missing name'];
    if (typeof name !== 'string') return ['Name must be a string'];

    if (!email) return ['Missing email'];
    if (!regularExps.email.test(email)) return ['Email is not valid'];

    if (localidad !== undefined && typeof localidad !== 'string') {
      return ['Localidad must be a string'];
    }

    if (!phone) return ['Missing phone'];

    if (empresa !== undefined && typeof empresa !== 'string') {
      return ['Empresa must be a string'];
    }

    if (actividad !== undefined && typeof actividad !== 'string') {
      return ['Actividad must be a string'];
    }

    if (!cotizar) return ['Missing cotizar'];
    if (!Array.isArray(cotizar) || !cotizar.every((i) => typeof i === 'string')) {
      return ['Cotizar must be an array of strings'];
    }

    if (!message) return ['Missing message'];
    if (typeof message !== 'string') return ['Message must be a string'];

    return [
      undefined,
      new ContactFormDto(
        name,
        email,
        localidad,
        phone,
        empresa,
        actividad,
        cotizar,
        message
      ),
    ];
  }
}
