
export class BddRequestError extends Error {
    constructor(message:string) {
        super(message)
        this.name = "BddRequestError"
    }
}