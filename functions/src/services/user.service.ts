import { firestore } from 'firebase-admin';


import { User } from '../models/user.model';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';
import { UserNotFoundException } from '../utils/exceptions/userNotFoundException';

import { User2} from '../entity/User';
import { AppDataSource } from '../ormconfig';


export class UserService {
    //private userCollection = firestore().collection('users');



    async getUserDataByID(id_usuario: string): Promise<User | null> {
        try {
            // Obtiene el repositorio de User
            const userRepository = AppDataSource.getRepository(User2);
    
            // Intenta obtener el usuario por su ID
            const user = await userRepository.findOneBy({ uid: id_usuario });
    
            if (!user) {
                throw new UserNotFoundException('Usuario no encontrado'); // Si no se encuentra el usuario
            }
    
            return user; // Retorna los datos del usuario si existe
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new UserNotFoundException(`Error al obtener los datos del usuario: ${error.message}`);
            } else {
                throw new UnknownErrorException('Error desconocido al obtener los datos del usuario'); // Manejo de errores no esperados
            }
        }
    }

    /*async getUserDataByID(id_usuario: string): Promise<User | null> {
        try {
            // Intentar obtener el documento del usuario por su ID
            console.log("HOLIWI");

            if (!userDoc.exists) {
                throw new UserNotFoundException('Usuario no encontrado');  // Si no se encuentra el usuario
            }

            // Convertir los datos del documento en un objeto User
            //const userData = userDoc.data() as User;
            var userData = {} as User
            return userData;
        } catch (error: unknown) { // Especifica el tipo 'unknown' aquí
            // Verifica si el error es una instancia de UserNotFoundException
            if (error instanceof Error) {
                throw new UserNotFoundException(`Error al obtener los datos del usuario: ${error.message}`);
            } else {
                throw new UnknownErrorException('Error desconocido al obtener los datos del usuario'); // Manejo de errores no esperados
            }
        }
    }*/

    // Método para obtener solo los objetivos del usuario
    async getUserGoals(id_usuario: string): Promise<{ macros: { carbs: number; proteins: number; fats: number; kcals: number }; goalWeight: number } | null> {
        try {
            //const userDoc = await this.userCollection.doc(id_usuario).get();

            /*if (!userDoc.exists) {
                throw new UserNotFoundException('Usuario no encontrado');
            }*/

            const userData = {} as User;

            // Devuelve solo los objetivos del usuario (macros y goalWeight)
            return {
                macros: userData.macros,
                goalWeight: userData.goalWeight,
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new UserNotFoundException(`Error al obtener los objetivos del usuario: ${error.message}`);
            } else {
                throw new UnknownErrorException('Error desconocido al obtener los objetivos del usuario');
            }
        }
    }
}
