export class ResetPasswordDto {
    constructor(
        public readonly token: string,
        public readonly newPassword: string
    ) {}

    static create(payload: any): [string | null, ResetPasswordDto | null] {
        const { token, newPassword } = payload;

        if (!token) {
            return ['Token is required', null];
        }

        if (!newPassword) {
            return ['New password is required', null];
        }

        if (typeof token !== 'string') {
            return ['Token must be a string', null];
        }

        if (typeof newPassword !== 'string') {
            return ['New password must be a string', null];
        }

        if (newPassword.length < 6) {
            return ['Password must be at least 6 characters long', null];
        }

        return [null, new ResetPasswordDto(token, newPassword)];
    }
}
