import { firestore } from 'firebase-admin';
import { User } from '../models/user.model';

export class UserService {
    private userCollection = firestore().collection('users');

    // Método para crear un nuevo usuario en Firestore
    async createUser(user: User): Promise<void> {
        const userRef = this.userCollection.doc(user.uid);
        await userRef.set(user);
    }

    async getUserDataByID(id_usuario: string): Promise<User | null> {
        try {
            // Intentar obtener el documento del usuario por su ID
            const userDoc = await this.userCollection.doc(id_usuario).get();

            if (!userDoc.exists) {
                throw new Error('Usuario no encontrado');  // Si no se encuentra el usuario
            }

            // Convertir los datos del documento en un objeto User
            const userData = userDoc.data() as User;
            return userData;
        } catch (error: unknown) { // Especifica el tipo 'unknown' aquí
            // Verifica si el error es una instancia de Error
            if (error instanceof Error) {
                throw new Error(`Error al obtener los datos del usuario: ${error.message}`);
            } else {
                throw new Error('Error desconocido al obtener los datos del usuario'); // Manejo de errores no esperados
            }
        }
    }

    // Método para obtener solo los objetivos del usuario
    async getUserGoals(id_usuario: string): Promise<{ macros: { carbs: number; proteins: number; fats: number; kcals: number }; goalWeight: number } | null> {
        try {
            const userDoc = await this.userCollection.doc(id_usuario).get();

            if (!userDoc.exists) {
                throw new Error('Usuario no encontrado');
            }

            const userData = userDoc.data() as User;

            // Devuelve solo los objetivos del usuario (macros y goalWeight)
            return {
                macros: userData.macros,
                goalWeight: userData.goalWeight,
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Error al obtener los objetivos del usuario: ${error.message}`);
            } else {
                throw new Error('Error desconocido al obtener los objetivos del usuario');
            }
        }
    }
}
