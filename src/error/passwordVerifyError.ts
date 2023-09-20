export class PasswordVerifyError extends Error {
    constructor(message:string) {
        super(message)
        this.name = `PasswordVerifyError`
    }
}