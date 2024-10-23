// src/utils/validation.ts

import { ValidationException } from './exceptions/passwordValidateException';



// Función para validar el correo electrónico
export const validateMail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular básica para validar el correo electrónico
    return emailRegex.test(email);
};

// Función para validar la contraseña
export const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    // Validar longitud mínima
    if (password.length < 8) {
        throw new ValidationException('La contraseña debe tener al menos 8 caracteres.');
    }

    // Validar al menos una letra minúscula
    if (!/[a-z]/.test(password)) {
        throw new ValidationException('La contraseña debe contener al menos una letra minúscula.');
    }

    // Validar al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) {
        throw new ValidationException('La contraseña debe contener al menos una letra mayúscula.');
    }

    // Validar al menos un número
    if (!/[0-9]/.test(password)) {
        throw new ValidationException('La contraseña debe contener al menos un número.');
    }

    // Validar al menos un carácter especial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        throw new ValidationException('La contraseña debe contener al menos un carácter especial.');
    }

};
