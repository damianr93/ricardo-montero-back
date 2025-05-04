import { Validators } from "../../../config";


export class CreateProductDto {

    private constructor(
        public readonly name: string,
        public readonly available: boolean,
        public readonly price: number,
        public readonly title: string,
        public readonly description: string,
        public readonly user: string,
        public readonly category: string,
        public readonly img?:string
    ){};

    static create( props: {[key:string]:any}):[string?,CreateProductDto?]{

        const {
            name,
            available,
            price,
            title,
            description,
            user,
            category,
            img
        } = props;

        if( !name ) return ['Missing name'];
        if( !user ) return ['Missing user'];
        if( !price ) return ['Missing price'];
        if( !title ) return ['Missing title'];
        if( !Validators.isMongoID(user) ) return ['Invalid User Id']
        if( !category ) return ['Missing category'];
        if( !Validators.isMongoID(category) ) return ['Invalid User Id']

        return [undefined, new CreateProductDto(
            name,
            !!available,
            price,
            title,
            description,
            user,
            category,
            img
        )];
    };
};