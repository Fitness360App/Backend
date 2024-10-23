// src/firebase.ts
import * as admin from 'firebase-admin';
import serviceAccount from '../config/firebase.json'; // Asegúrate de que la ruta sea correcta
import { ServiceAccount } from 'firebase-admin';

// Afirmar que serviceAccount tiene el tipo correcto
const serviceAccountParsed = serviceAccount as ServiceAccount;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountParsed), // Usar las credenciales de servicio
});

// Exportar la instancia de auth
const auth = admin.auth();

export { admin, auth }; // Exportar admin y auth
