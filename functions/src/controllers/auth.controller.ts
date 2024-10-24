// src/controllers/auth.controller.ts
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { ValidationException } from '../utils/exceptions/passwordValidateException';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';

export class AuthController {
    private authService: AuthService;
    private userService: UserService;

    constructor() {
        this.authService = new AuthService();
        this.userService = new UserService();
    }

    // Método para registrar un nuevo usuario
    register = async (req: any, res: any) => {
        const {
            email,
            password,
            name,
            lastName1,
            lastName2,
            actualWeight,
            goalWeight,
            height,
            age,
            gender,
            activityLevel,
            role,
            macros,
        } = req.body;

        // Validación de entrada
        if (!email) {
            throw new ValidationException('Email is required');
        }

        if (!password) {
            throw new ValidationException('Password is required');
        }

        if (!name) {
            throw new ValidationException('Name is required');
        }

        try {
            const userRecord = await this.authService.createUser(email, password);

            // Crear objeto de usuario para Firestore
            const user: User = {
                uid: userRecord.uid,
                name,
                lastName1,
                lastName2,
                actualWeight,
                goalWeight,
                height,
                age,
                gender,
                activityLevel,
                role,
                macros,
            };

            // Guardar el usuario en Firestore
            await this.userService.createUser(user);

            res.status(201).json({ uid: userRecord.uid }); // Devuelve el ID del usuario creado
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message }); // Manejo de errores
            } else {
                throw new UnknownErrorException('Unknown error occurred'); // Error desconocido
            }
        }
    };


    login = async (req: any, res: any) => {
        const { idToken } = req.body; // Aquí recibes el ID token

        if (!idToken) {
            return res.status(400).json({ error: 'ID token is required' });
        }

        try {
            const userRecord = await this.authService.login(idToken);
            res.status(200).json({ uid: userRecord.uid }); // Devuelve el ID del usuario que inició sesión
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message }); // Manejo de errores
            } else {
                res.status(400).json({ error: 'Unknown error occurred' }); // Error desconocido
            }
        }
    };
}
