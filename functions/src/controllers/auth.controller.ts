// src/controllers/auth.controller.ts
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

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
            activityLevel,
            role,
            macros,
        } = req.body;

        // Validación de entrada
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
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
                res.status(400).json({ error: 'Unknown error occurred' }); // Error desconocido
            }
        }
    };
}
