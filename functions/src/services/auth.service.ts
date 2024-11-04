// src/services/auth.service.ts
import { validateMail, validatePassword } from '../utils/validation';
import { ValidationException } from '../utils/exceptions/passwordValidateException';

import { v4 as uuidv4 } from 'uuid';

import { AppDataSource } from "../ormconfig";
import { User2 } from "../entity/User";
import * as bcrypt from 'bcrypt';


export class AuthService {
    /*async createUser(email: string, password: string) {
        // Validar correo electrónico
        if (!validateMail(email)) {
            throw new ValidationException('Formato de correo electrónico no válido');
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
    }*/


    async createUser(email: string, password: string): Promise<string> {
        // Validar correo electrónico
        if (!validateMail(email)) {
            throw new ValidationException('Formato de correo electrónico no válido');
        }

        // Validar contraseña
        validatePassword(password);

        // Generar un UID único para el usuario
        const uid = uuidv4();

        return uid;
    }

    /*async login(idToken: string) {
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            console.log(decodedToken)
            return { uid: decodedToken.uid };
        } catch (error) {
            throw new ValidationException('Error al iniciar sesión: Token inválido');
        }
    }*/

    async login(email: string, password: string) {
        // Obtiene el repositorio de User
        const userRepository = AppDataSource.getRepository(User2);

        // Busca al usuario por email
        const user = await userRepository.findOneBy({ email });
        
        // Si el usuario no existe, lanza una excepción
        if (!user) {
            throw new ValidationException('Error al iniciar sesión: Usuario no encontrado');
        }

        // Verifica si la contraseña es correcta
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new ValidationException('Error al iniciar sesión: Contraseña incorrecta');
        }

        // Retorna el UID si el inicio de sesión es exitoso
        return { uid: user.uid };
    }

}
