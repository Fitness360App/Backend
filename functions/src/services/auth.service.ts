// src/services/auth.service.ts
import { auth } from '../firebase';
import { validateMail, validatePassword } from '../utils/validation';
import { ValidationException } from '../utils/exceptions/passwordValidateException';


export class AuthService {
    async createUser(email: string, password: string) {
        // Validar correo electrónico
        if (!validateMail(email)) {
            throw new Error('Formato de correo electrónico no válido');
        }

        // Validar contraseña
        validatePassword(password);

        try {
            const userRecord = await auth.createUser({
                email,
                password,
            });
            return { uid: userRecord.uid };
        } catch (error) {
            throw new ValidationException(`Error al crear el usuario: El correo ya está registrado`);
        }
    }
}
