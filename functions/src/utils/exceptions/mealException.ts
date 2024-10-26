export class MealException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MealException';
    }
}