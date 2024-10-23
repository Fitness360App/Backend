// src/services/user.service.ts
import { firestore } from 'firebase-admin';
import { User } from '../models/user.model';

export class UserService {
    private userCollection = firestore().collection('users');

    // Método para crear un nuevo usuario en Firestore
    async createUser(user: User): Promise<void> {
        const userRef = this.userCollection.doc(user.uid);
        await userRef.set(user);
    }
}
