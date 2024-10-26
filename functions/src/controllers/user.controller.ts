import { UserService } from '../services/user.service';
import { UserNotFoundException } from '../utils/exceptions/userNotFoundException';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    // Método para obtener los datos del usuario por ID
    getUserDataByID = async (req: any, res: any) => {
        const { id } = req.params;  // Obtener el ID del usuario desde los parámetros de la URL

        try {
            const userData = await this.userService.getUserDataByID(id);

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


        // Método para obtener solo los objetivos del usuario
        getUserGoals = async (req: any, res: any) => {
            const { id } = req.params;  // Obtener el ID del usuario desde los parámetros de la URL
    
            try {
                const goals = await this.userService.getUserGoals(id);
    
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
