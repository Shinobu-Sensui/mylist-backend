export class PasswordHashingError extends Error {
    constructor(message:string) {
        super(message)
        this.name = "PasswordHashingError"
    }
}