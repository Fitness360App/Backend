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
            console.log(user);
            return user; // Retorna los datos del usuario si existe
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new UserNotFoundException(`Error al obtener los datos del usuario: ${error.message}`);
            } else {
                throw new UnknownErrorException('Error desconocido al obtener los datos del usuario'); // Manejo de errores no esperados
            }
        }
    }

    // Método para obtener solo los objetivos del usuario
    async getUserGoals(id_usuario: string): Promise<{ macros: { carbs: number; proteins: number; fats: number; kcals: number }; goalWeight: number } | null> {
        try {
            // Obtén el repositorio de User
            const userRepository = AppDataSource.getRepository(User2);
    
            // Busca al usuario por ID
            const user = await userRepository.findOneBy({ uid: id_usuario });
    
            // Si no se encuentra el usuario, lanza una excepción
            if (!user) {
                throw new UserNotFoundException('Usuario no encontrado');
            }
    
            // Devuelve solo los objetivos del usuario (macros y goalWeight)
            return {
                macros: {
                    carbs: user.carbs,
                    proteins: user.proteins,
                    fats: user.fats,
                    kcals: user.kcals,
                },
                goalWeight: user.goalWeight,
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new UserNotFoundException(`Error al obtener los objetivos del usuario: ${error.message}`);
            } else {
                throw new UnknownErrorException('Error desconocido al obtener los objetivos del usuario');
            }
        }
    }


    async modifyUserData(uid: string, updatedData: Partial<Omit<User2, 'uid' | 'role' | 'macros'>>): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(User2);
            
            // Verifica si el usuario existe
            const user = await userRepository.findOneBy({ uid });
            if (!user) {
                throw new UserNotFoundException('Usuario no encontrado');
            }
    
            // Actualiza solo los campos permitidos
            await userRepository.update(uid, updatedData);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new UserNotFoundException(`Error al modificar los datos del usuario: ${error.message}`);
            } else {
                throw new UnknownErrorException('Error desconocido al modificar los datos del usuario');
            }
        }
    }


    async modifyUserGoals(uid: string, updatedGoals: { carbs: number; proteins: number; fats: number; kcals: number }): Promise<void> {
        const userRepository = AppDataSource.getRepository(User2);
        
        // Verifica si el usuario existe
        const user = await userRepository.findOneBy({ uid });
        if (!user) {
            throw new UserNotFoundException('Usuario no encontrado');
        }
    
        // Actualiza los macros
        await userRepository.update(uid, {
            carbs: updatedGoals.carbs,
            proteins: updatedGoals.proteins,
            fats: updatedGoals.fats,
            kcals: updatedGoals.kcals
        });
    }

    async isUserAdmin(uid: string): Promise<boolean> {
        try {
            // Obtiene el repositorio de usuarios de TypeORM
            const userRepository = AppDataSource.getRepository(User2);

            // Busca el usuario por `uid`
            const user = await userRepository.findOneBy({ uid });
            
            // Si el usuario no existe, lanza una excepción
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Retorna `true` si el rol es "admin", de lo contrario `false`
            return user.role === 'admin';
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Error al verificar el rol del usuario: ${error.message}`);
            } else {
                throw new Error('Error desconocido al verificar el rol del usuario');
            }
        }
    }
    
    
    
}