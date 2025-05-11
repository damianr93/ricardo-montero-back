import { regularExps } from "../../config/regular-exp";

export class ContactFromChatBotDto {
    private constructor(
        public asunto: string,
        public cantidadAnimales: string | undefined,
        public categoriaAnimal: string | undefined,
        public nombreCliente: string | undefined,
        public producto: string,
        public telefono: string | undefined,
        public tiempoRequerido: string | undefined,
        public tipoAnimal: string | undefined,
        public tipoBovino: string | undefined,
        public zona: string | undefined,
    ) { }

    static create(
        object: Record<string, any>
    ): [string | undefined, ContactFromChatBotDto?] {
        const {
            asunto,
            cantidadAnimales,
            categoriaAnimal,
            nombreCliente,
            producto,
            telefono,
            tiempoRequerido,
            tipoAnimal,
            tipoBovino,
            zona,
        } = object;

        if (!asunto) return ['Falta asunto'];
        if (typeof asunto !== 'string') return ['Asunto debe ser un texto'];


        if (telefono !== undefined && typeof telefono !== 'string') {
            return ['Teléfono debe ser un texto'];
        }

        return [
            undefined,
            new ContactFromChatBotDto(
                asunto,
                cantidadAnimales,
                categoriaAnimal,
                nombreCliente,
                producto,
                telefono,
                tiempoRequerido,
                tipoAnimal,
                tipoBovino,
                zona
            ),
        ];
    }
}