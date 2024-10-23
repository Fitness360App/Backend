// Cambia la sintaxis de importación
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

// Configura tu proyecto de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC24KIOgBSYMrYQI5xZfZclgFEeIsVB4hc",
    authDomain: "fitness360-cc4a2.firebaseapp.com",
    projectId: "fitness360-cc4a2",
    storageBucket: "fitness360-cc4a2.appspot.com",
    messagingSenderId: "902794956175",
    appId: "1:902794956175:web:b0ef58888351082c7c4ffa"
  };

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// Función para iniciar sesión
async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Obtener ID Token
        const idToken = await user.getIdToken();

        // Aquí puedes enviar el ID token a tu backend para iniciar sesión
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken })
        });

        const data = await response.json();
        console.log('Usuario logueado:', data);
        return data; // Retorna la respuesta del servidor
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        throw error; // Propaga el error
    }
}

// Ejemplo de uso
(async () => {
    const email = 'ejemplo21@correo.com'; // Cambia por el correo del usuario
    const password = 'contraseñaSegura123$'; // Cambia por la contraseña del usuario

    try {

        // Iniciar sesión
        const loginResponse = await login(email, password);
        console.log('Inicio de sesión exitoso:', loginResponse);
    } catch (error) {
        console.error('Error durante el proceso:', error);
    }
})();
