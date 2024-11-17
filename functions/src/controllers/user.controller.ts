import { UserService } from '../services/user.service';
import { UserNotFoundException } from '../utils/exceptions/userNotFoundException';
import * as bcrypt from 'bcrypt';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    // Método para obtener los datos del usuario por ID
    getUserDataByID = async (req: any, res: any) => {
        const { uid } = req.params;  // Obtener el ID del usuario desde los parámetros de la URL
        console.log("ESTO ES EL UID:",uid)
        
        try {
            const userData = await this.userService.getUserDataByID(uid);

            if (!userData) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.status(200).json(userData);  // Devolver los datos del usuario
        } catch (error: any) {
            return res.status(500).json({ message: 'Error desconocido al obtener los datos del usuario' });
        }
    };

    userExists = async (uid: string): Promise<boolean> => {
        try {
            const userData = await this.userService.getUserDataByID(uid);
            return !!userData;  // Devolver true si existe, false si no
        } catch (error) {
            return false;
        }
    };


    // Método para obtener solo los objetivos del usuario
    getUserGoals = async (req: any, res: any) => {
        const { id } = req.body;  

        try {
            const goals = await this.userService.getUserGoals(id);

            if (!goals) {
                return res.status(404).json({ message: 'Objetivos no encontrados' });
            }

            return res.status(200).json(goals); 
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Error desconocido ocurrió' });
            }
        }
    };



    modifyUserData = async (req: any, res: any) => {
        const { uid } = req.body;  
        const updatedData = {   
            name: req.body.name,
            lastName1: req.body.lastName1,
            actualWeight: req.body.actualWeight,
            goalWeight: req.body.goalWeight,
            height: req.body.height,
            age: req.body.age,
            activityLevel: req.body.activityLevel,
        };


        console.log("Esto es el updatedData:",updatedData)

        try {
            // Verificar si el usuario existe antes de modificar
            const exists = await this.userExists(uid);
            if (!exists) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            await this.userService.modifyUserData(uid, updatedData);
            return res.status(200).json({ message: 'Datos del usuario actualizados exitosamente' });
        } catch (error: unknown) {
            if (error instanceof UserNotFoundException) {
                return res.status(404).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Error desconocido ocurrió' });
            }
        }
    };


    modifyUserGoals = async (req: any, res: any) => {
        const { uid } = req.body; // Obtener el ID del usuario desde el cuerpo de la solicitud

        console.log("UID:",uid)
        const updatedGoals = {   // Crear un objeto para los nuevos objetivos de macros
            carbs: req.body.carbs,
            proteins: req.body.proteins,
            fats: req.body.fats,
            kcals: req.body.kcals,
        };

        try {
            // Verifica si el usuario existe
            const userExists = await this.userExists(uid);
            
            if (!userExists) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Llama al servicio para actualizar los objetivos del usuario
            await this.userService.modifyUserGoals(uid, updatedGoals);

            return res.status(200).json({ message: 'Objetivos del usuario actualizados exitosamente' });
        } catch (error) {


            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Error desconocido ocurrió' });
            }
        }
    };

    isUserAdmin = async (req: any, res: any) => {
        const { uid } = req.params; // uid pasado en el cuerpo de la solicitud

        try {
            const isAdmin = await this.userService.isUserAdmin(uid);
            return res.status(200).json({ isAdmin });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
    };
    

    deleteUser = async (req: any, res: any) => {
        const { uid } = req.params; 

        try {
            // Verifica si el usuario existe
            const userExists = await this.userExists(uid);
            if (!userExists) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Llama al servicio para eliminar el usuario
            await this.userService.deleteUser(uid);

            return res.status(200).json({ message: 'Usuario eliminado exitosamente' });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Error desconocido ocurrió' });
            }
        }
    };

    checkUserEmail = async (req: any, res: any) => {
        const { email } = req.params; 

        try {
            const exists = await this.userService.checkUserEmail(email);
            console.log("Existe:",exists)
            return res.status(200).send(exists);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Error desconocido ocurrió' });
            }
        }
    };

    // Método para enviar un correo de confirmación
    sendEmailConfirmation = async (req: any, res: any) => {
        const { uid, password, oldpassword } = req.body; 

        try {
            //Obtener el usuario por ID
            const user = await this.userService.getUserDataByID(uid) as any;

            /*const isOldPasswordCorrect = await bcrypt.compare("123456Aa@", user.passwordHash);

            
            if (!isOldPasswordCorrect) {
                console.log("Contraseña antigua incorrecta")
                return res.status(401).json({ message: 'Contraseña antigua incorrecta' });
            }*/

            // Llama al servicio para cambiar la contraseña del usuario
            const validationCode = await this.userService.sendEmailConfirmation(uid, password);

            //Devolver el codigo de validacion junto a un 200
            console.log("Codigo de validacion:",validationCode)
            return res.status(200).send(validationCode); // Devuelve solo el código como texto
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Error desconocido ocurrió' });
            }
        }
    };

    // Método para cambiar la contraseña del usuario
    changePassword = async (req: any, res: any) => {
        const { uid, password } = req.body; 

        try {
            console.log("UID:",uid)
            console.log("Password:",password)
            await this.userService.changePassword(uid, password);
            return res.status(200).json({ message: 'Contraseña cambiada exitosamente' });
        } catch (error) {
            if (error instanceof Error) {
                console.log(error)
                return res.status(500).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Error desconocido ocurrió' });
            }
        }
    }
}