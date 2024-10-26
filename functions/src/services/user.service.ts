import { firestore } from 'firebase-admin';
import { User } from '../models/user.model';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';
import { UserNotFoundException } from '../utils/exceptions/userNotFoundException';

export class UserService {
    private userCollection = firestore().collection('users');

    // Método para crear un nuevo usuario en Firestore
    async createUser(user: User): Promise<void> {
        const userRef = this.userCollection.doc(user.uid);
        await userRef.set(user);
    }

    async getUserDataByID(id_usuario: string): Promise<User> {
        try {
            // Intentar obtener el documento del usuario por su ID
            const userDoc = await this.userCollection.doc(id_usuario).get();

            if (!userDoc.exists) {
                throw new UserNotFoundException('Usuario no encontrado');  // Si no se encuentra el usuario
            }

            // Convertir los datos del documento en un objeto User
            const userData = userDoc.data() as User;
            return userData;
        } catch (error: unknown) { // Especifica el tipo 'unknown' aquí
            // Verifica si el error es una instancia de UserNotFoundException
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
            const userDoc = await this.userCollection.doc(id_usuario).get();

            if (!userDoc.exists) {
                throw new UserNotFoundException('Usuario no encontrado');
            }

            const userData = userDoc.data() as User;

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


    // Método para modificar los datos del usuario
    async modifyUserData(uid: string, updatedData: Partial<Omit<User, 'uid' | 'role' | 'macros'>>): Promise<void> {
        try {
            const userDoc = await this.userCollection.doc(uid).get();
            if (!userDoc.exists) {
                throw new UserNotFoundException('Usuario no encontrado');
            }

            // Actualizar solo los campos permitidos
            await this.userCollection.doc(uid).update(updatedData);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new UserNotFoundException(`Error al modificar los datos del usuario: ${error.message}`);
            } else {
                throw new UnknownErrorException('Error desconocido al modificar los datos del usuario');
            }
        }
    }

    async modifyUserGoals(uid: string, updatedGoals: { carbs: number; proteins: number; fats: number; kcals: number }): Promise<void> {
        const userRef = this.userCollection.doc(uid);
        await userRef.update({
            macros: updatedGoals
        });
    }

}
