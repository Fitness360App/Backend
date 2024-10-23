// src/controllers/auth.controller.ts
import { AuthService } from '../services/auth.service';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    // Método para registrar un nuevo usuario
    register = async (req: any, res: any) => {
        const { email, password } = req.body;

        // Validación de entrada
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        try {
            const user = await this.authService.createUser(email, password);
            res.status(201).json({ uid: user.uid }); // Devuelve el ID del usuario creado
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message }); // Manejo de errores
            } else {
                res.status(400).json({ error: 'Unknown error occurred' }); // Error desconocido
            }
        }
    };
}
