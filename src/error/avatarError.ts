export class AvatarError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AvatarError'
    }
}