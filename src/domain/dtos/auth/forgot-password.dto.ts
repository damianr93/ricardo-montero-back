export class ForgotPasswordDto {
    constructor(
        public readonly email: string
    ) {}

    static create(payload: any): [string | null, ForgotPasswordDto | null] {
        const { email } = payload;

        if (!email) {
            return ['Email is required', null];
        }

        if (typeof email !== 'string') {
            return ['Email must be a string', null];
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return ['Invalid email format', null];
        }

        return [null, new ForgotPasswordDto(email)];
    }
}
