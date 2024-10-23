// src/utils/PasswordValidateException.ts

export class ValidationException extends Error {
    constructor(message: string) {
        super(message); // Llama al constructor de la clase Error
        this.name = "ValidationException"; // Establece el nombre de la excepción
    }
}
