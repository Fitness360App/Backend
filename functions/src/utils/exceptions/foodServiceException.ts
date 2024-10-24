export class FoodServiceException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FoodServiceException';
    }
}