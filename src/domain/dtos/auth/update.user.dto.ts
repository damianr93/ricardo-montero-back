

export class UpdateUserDto {
    constructor(
      public readonly name?: string,
      public readonly role?: string[],
      public readonly img?: string
    ){}
  
    static create(payload: any): [string | null, UpdateUserDto | null] {
      const { name, role, img } = payload;
      // valida lo que necesites
      if (name !== undefined && typeof name !== 'string') {
        return ['Name must be a string', null];
      }
      if (role !== undefined && !Array.isArray(role)) {
        return ['Role must be an array', null];
      }

      if (img !== undefined && typeof name !== 'string') {
        return ['no se encuentra el enlace de la imagen', null];
      }

      return [null, new UpdateUserDto(name, role)];
    }
  }