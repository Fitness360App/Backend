import { UserService } from '../services/user.service';

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
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.status(200).json(userData);  // Devolver los datos del usuario
        } catch (error: any) {
            res.status(500).json({ error: error.message });  // Manejo de errores
        }
    };


        // Método para obtener solo los objetivos del usuario
        getUserGoals = async (req: any, res: any) => {
            const { id } = req.params;  // Obtener el ID del usuario desde los parámetros de la URL
    
            try {
                const goals = await this.userService.getUserGoals(id);
    
                if (!goals) {
                    return res.status(404).json({ error: 'Usuario no encontrado' });
                }
    
                res.status(200).json(goals);  // Devolver los objetivos del usuario
            } catch (error) {
                if (error instanceof Error) {
                    res.status(500).json({ error: error.message });
                } else {
                    res.status(500).json({ error: 'Error desconocido al obtener los objetivos' });
                }
            }
        };
}
