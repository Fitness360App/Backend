import { UserService } from '../services/user.service';
import { InternalException } from '../utils/exceptions/InternalException';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';
import { UserNotFoundException } from '../utils/exceptions/userNotFoundException';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    // Método para obtener los datos del usuario por ID
    getUserDataByID = async (req: any, res: any) => {
        const { id } = req.body;  // Obtener el ID del usuario desde los parámetros de la URL

        try {
            const userData = await this.userService.getUserDataByID(id);

            if (!userData) {
                throw new UserNotFoundException('Usuario no encontrado');
            }

            res.status(200).json(userData);  // Devolver los datos del usuario
        } catch (error: any) {
            throw new InternalException(error.message);
        }
    };


    // Método para obtener solo los objetivos del usuario
    getUserGoals = async (req: any, res: any) => {
        const { id } = req.body;  // Obtener el ID del usuario desde los parámetros de la URL

        try {
            const goals = await this.userService.getUserGoals(id);

            if (!goals) {
                throw new UserNotFoundException('Usuario no encontrado');
            }

            res.status(200).json(goals); 
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalException(error.message);
            } else {
                throw new UnknownErrorException('Error desconocido al obtener los objetivos');
            }
        }
    };



    modifyUserData = async (req: any, res: any) => {
        const { uid } = req.body;   // Obtener el ID del usuario desde los parámetros de la URL
        const updatedData = {   // Crear un objeto separado para los datos actualizados
            name: req.body.name,
            lastName1: req.body.lastName1,
            lastName2: req.body.lastName2,
            actualWeight: req.body.actualWeight,
            goalWeight: req.body.goalWeight,
            height: req.body.height,
            age: req.body.age,
            gender: req.body.gender,
            activityLevel: req.body.activityLevel,
        };

        try {
            // Verificar si el usuario existe antes de modificar
            /*const exists = await this.userExists(uid);
            if (!exists) {
                throw new UserNotFoundException('Usuario no encontrado');
            }*/

            await this.userService.modifyUserData(uid, updatedData);
            res.status(200).json({ message: 'Datos del usuario actualizados exitosamente' });
        } catch (error: unknown) {
            if (error instanceof UserNotFoundException) {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Error desconocido ocurrió' });
            }
        }
    };


    modifyUserGoals = async (req: any, res: any) => {
        const { uid } = req.body; // Obtener el ID del usuario desde el cuerpo de la solicitud
        const updatedGoals = {   // Crear un objeto para los nuevos objetivos de macros
            carbs: req.body.macros.carbs,
            proteins: req.body.macros.proteins,
            fats: req.body.macros.fats,
            kcals: req.body.macros.kcals,
        };

        try {
            // Verifica si el usuario existe
            /*const userExists = await this.userExists(uid);
            
            if (!userExists) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }*/

            // Llama al servicio para actualizar los objetivos del usuario
            await this.userService.modifyUserGoals(uid, updatedGoals);

            res.status(200).json({ message: 'Objetivos del usuario actualizados exitosamente' });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Error desconocido ocurrió' });
            }
        }
    };

    isUserAdmin = async (req: any, res: any) => {
        const { uid } = req.body; // uid pasado en el cuerpo de la solicitud

        try {
            const isAdmin = await this.userService.isUserAdmin(uid);
            res.status(200).json({ isAdmin });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
    };
    
}