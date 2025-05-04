


export class UpdateCategoryDto {

    private constructor(

        public readonly name?:string,
        public readonly available?:boolean
    ){}

    static update(object: { [ key:string ] : any } ):[string?,UpdateCategoryDto?]{
        const {name, available = true} = object;
        let availableBoolean = available

        return [undefined, new UpdateCategoryDto(name, availableBoolean)];
    }

}