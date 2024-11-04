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
    //private userService: UserService;

    constructor() {
        this.authService = new AuthService();
        //this.userService = new UserService();
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
        if (!email) throw new ValidationException('Email is required');
        if (!password) throw new ValidationException('Password is required');
        if (!name) throw new ValidationException('Name is required');

        try {
            const authService = new AuthService();
            const uid = await authService.createUser(email, password);

            // Crear y guardar el usuario en MySQL
            const userRepository = AppDataSource.getRepository(User2);
            const newUser = userRepository.create({
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

            res.status(201).json({ uid }); // Devuelve el ID del usuario creado
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalException(error.message); // Error interno
            } else {
                throw new UnknownErrorException('Unknown error occurred'); // Error desconocido
            }
        }
    };
    // Método para registrar un nuevo usuario
    /*register = async (req: any, res: any) => {
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
                throw new InternalException(error.message); // Error interno
            } else {
                throw new UnknownErrorException('Unknown error occurred'); // Error desconocido
            }
        }
    };*/


    /*login = async (req: any, res: any) => {
        const { idToken } = req.body; // Aquí recibes el ID token

        if (!idToken) {
            return res.status(400).json({ error: 'ID token is required' });
        }

        try {
            const userRecord = await this.authService.login(idToken);
            res.status(200).json({ uid: userRecord.uid }); // Devuelve el ID del usuario que inició sesión
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new InternalException(error.message); // Error interno
            } else {
                throw new UnknownErrorException('Unknown error occurred'); // Error desconocido
            }
        }
    };*/


    login = async (req: Request, res: Response) => {
        const { email, password } = req.body;

        // Validación de entrada
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        try {
            const authService = new AuthService();
            const userRecord = await authService.login(email, password);
            res.status(200).json({ uid: userRecord.uid }); // Devuelve el ID del usuario autenticado
        } catch (error) {
            if (error instanceof ValidationException) {
                return res.status(400).json({ error: error.message }); // Error de validación
            } else if (error instanceof InternalException) {
                return res.status(500).json({ error: error.message }); // Error interno
            } else {
                throw new UnknownErrorException('Unknown error occurred'); // Error desconocido
            }
        }
    };
}
