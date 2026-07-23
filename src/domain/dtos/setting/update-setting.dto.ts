export class UpdateSettingDto {

    private constructor(
        public readonly minOrderAmount: number,
    ) {}

    static update(object: { [key: string]: any }): [string?, UpdateSettingDto?] {
        const { minOrderAmount } = object;

        if (minOrderAmount === undefined || minOrderAmount === null) {
            return ['Missing minOrderAmount'];
        }

        const value = Number(minOrderAmount);
        if (Number.isNaN(value) || !Number.isFinite(value)) {
            return ['minOrderAmount must be a number'];
        }
        if (value < 0) {
            return ['minOrderAmount cannot be negative'];
        }

        return [undefined, new UpdateSettingDto(value)];
    }
}
