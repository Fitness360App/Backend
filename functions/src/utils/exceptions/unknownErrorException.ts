export class UnknownErrorException extends Error {
    constructor(message: string ) {
        super(message);
        this.name = 'UnknownErrorException';
    }
}