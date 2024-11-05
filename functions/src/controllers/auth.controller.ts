// src/controllers/auth.controller.ts
import { AuthService } from '../services/auth.service';
//import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { ValidationException } from '../utils/exceptions/passwordValidateException';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';
import { InternalException } from '../utils/exceptions/InternalException';

import { Request, Response } from 'express';
import { AppDataSource } from '../ormconfig';
import { User2 } from '../entity/User';
import * as bcrypt from 'bcrypt';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }


    register = async (req: Request, res: Response) => {
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
        if (!email) return res.status(400).json({ error: 'Email is required' });
        if (!password) return res.status(400).json({ error: 'Password is required' });
        if (!name) return res.status(400).json({ error: 'Name is required' });

        try {
            const authService = new AuthService();
            const uid = await authService.createUser(email, password);

            // Crear y guardar el usuario en MySQL
            const userRepository = AppDataSource.getRepository(User2);
            const newUser = userRepository.create({
                uid,
                email,
                passwordHash: await bcrypt.hash(password, 10), // Hash de la contraseña
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
                carbs: macros.carbs,
                proteins: macros.proteins,
                fats: macros.fats,
                kcals: macros.kcals,
            });

            await userRepository.save(newUser);

            return res.status(201).json({ uid }); // Devuelve el ID del usuario creado
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ error: error.message }); // Error interno
            } else {
                return res.status(500).json({ error: 'Unknown error occurred' }); // Error desconocido
            }
        }
    };


    login = async (req: Request, res: Response) => {
        const { email, password } = req.body;

        // Validación de entrada
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        try {
            const authService = new AuthService();
            const userRecord = await authService.login(email, password);
            return res.status(200).json({ uid: userRecord.uid }); 
        } catch (error) {
            if (error instanceof ValidationException) {
                return res.status(400).json({ error: error.message }); // Error de validación
            } else if (error instanceof InternalException) {
                return res.status(500).json({ error: error.message }); // Error interno
            } else {
                return res.status(500).json({ error: 'Unknown error occurred' }); // Error desconocido
            }
        }
    };
}