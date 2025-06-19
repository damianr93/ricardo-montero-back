export class UpdateProductDto {
  private constructor(
    public readonly name: string,
    public readonly available: boolean,
    public readonly price: number,
    public readonly title: string,
    public readonly description: string,
    public readonly user: string,
    public readonly category: string,
    public readonly codigo: string | number,
    public readonly img?: string[]
  ) {}

  static create(props: { [key: string]: any }): [string?, UpdateProductDto?] {
    const {
      name,
      available,
      price,
      title,
      description,
      user,
      codigo,
      category,
      img
    } = props;

    return [undefined, new UpdateProductDto(
      name,
      !!available,
      price,
      title,
      description,
      user,
      category,  
      codigo,    
      img
    )];
  }
}
