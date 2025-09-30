
export class UpdateUserDto {
    constructor(
      public readonly name?: string,
      public readonly email?: string,
      public readonly razonSocial?: string,
      public readonly CUIT?: string,
      public readonly phone?: string,
      public readonly direccion?: string,
      public readonly localidad?: string,
      public readonly provincia?: string,
      public readonly codigoPostal?: number,
      public readonly role?: string[],
      public readonly approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED',
      public readonly img?: string
    ){}
  
    static create(payload: any): [string | null, UpdateUserDto | null] {
      const { 
        name, 
        email, 
        razonSocial, 
        CUIT, 
        phone, 
        direccion, 
        localidad, 
        provincia, 
        codigoPostal, 
        role, 
        approvalStatus, 
        img 
      } = payload;

      if (name !== undefined && typeof name !== 'string') {
        return ['Name must be a string', null];
      }
      if (email !== undefined && typeof email !== 'string') {
        return ['Email must be a string', null];
      }
      if (razonSocial !== undefined && typeof razonSocial !== 'string') {
        return ['RazonSocial must be a string', null];
      }
      if (CUIT !== undefined && typeof CUIT !== 'string') {
        return ['CUIT must be a string', null];
      }
      if (phone !== undefined && typeof phone !== 'string') {
        return ['Phone must be a string', null];
      }
      if (direccion !== undefined && typeof direccion !== 'string') {
        return ['Direccion must be a string', null];
      }
      if (localidad !== undefined && typeof localidad !== 'string') {
        return ['Localidad must be a string', null];
      }
      if (provincia !== undefined && typeof provincia !== 'string') {
        return ['Provincia must be a string', null];
      }
      if (codigoPostal !== undefined && typeof codigoPostal !== 'number') {
        return ['CodigoPostal must be a number', null];
      }
      if (role !== undefined && !Array.isArray(role)) {
        return ['Role must be an array', null];
      }
      if (approvalStatus !== undefined && !['PENDING', 'APPROVED', 'REJECTED'].includes(approvalStatus)) {
        return ['Invalid approval status', null];
      }
      if (img !== undefined && typeof img !== 'string') {
        return ['Img must be a string', null];
      }

      return [null, new UpdateUserDto(
        name, 
        email, 
        razonSocial, 
        CUIT, 
        phone, 
        direccion, 
        localidad, 
        provincia, 
        codigoPostal, 
        role, 
        approvalStatus, 
        img
      )];
    }
  }