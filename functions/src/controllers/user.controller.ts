import { UserService } from '../services/user.service';
import { UserNotFoundException } from '../utils/exceptions/userNotFoundException';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }


    // Nueva función para verificar si el usuario existe
    userExists = async (uid: string): Promise<boolean> => {
        try {
            const userData = await this.userService.getUserDataByID(uid);
            return !!userData;  // Devolver true si existe, false si no
        } catch (error) {
            // Puedes manejar excepciones específicas o simplemente lanzar el error
            return false;
        }
    };

    // Método para obtener los datos del usuario por ID
    getUserDataByID = async (req: any, res: any) => {
        const { uid } = req.body;  // Obtener el ID del usuario desde los parámetros de la URL

        try {
            const userData = await this.userService.getUserDataByID(uid);

            if (!userData) {
                throw new UserNotFoundException('Usuario no encontrado');
            }

            res.status(200).json(userData);  // Devolver los datos del usuario
        } catch (error: any) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
    };


    //PENSAR SI QUITAR ESTE MÉTODO
    // Método para obtener solo los objetivos del usuario
    getUserGoals = async (req: any, res: any) => {
        const { uid } = req.body;  // Obtener el ID del usuario desde los parámetros de la URL

        try {
            const goals = await this.userService.getUserGoals(uid);

            if (!goals) {
                throw new UserNotFoundException('Usuario no encontrado');
            }

            res.status(200).json(goals); 
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
    };
}
