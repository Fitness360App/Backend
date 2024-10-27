// Cambia la sintaxis de importación
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

// Configura tu proyecto de Firebase
/*const serviceAccount = {
    apiKey: "AIzaSyC24KIOgBSYMrYQI5xZfZclgFEeIsVB4hc",
    authDomain: "fitness360-cc4a2.firebaseapp.com",
    projectId: "fitness360-cc4a2",
    storageBucket: "fitness360-cc4a2.appspot.com",
    messagingSenderId: "902794956175",
    appId: "1:902794956175:web:b0ef58888351082c7c4ffa"
};*/

// Importa el SDK de Firebase Admin
const admin = require("firebase-admin");

// Inicializar la app de Firebase Admin con el archivo JSON de credenciales
const serviceAccount = require("./functions/config/firebase.json"); // Cambia la ruta según sea necesario

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function createUserAndSendVerification(email, password) {
  try {
    // Crear el usuario en Firebase
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });
    console.log("Usuario creado exitosamente:", userRecord.uid);

    // Generar el enlace de verificación de correo
    const emailVerificationLink = await admin.auth().generateEmailVerificationLink(email);
    console.log("Enlace de verificación de correo generado:", emailVerificationLink);

    // Aquí puedes enviar el enlace de verificación por correo electrónico usando un servicio de correo externo
  } catch (error) {
    console.error("Error al crear usuario o enviar correo de verificación:", error);
  }
}

// Llama a la función de creación y verificación
const email = "acaimopcgc@gmail.com";
const password = "meGustanPene1s#";
createUserAndSendVerification(email, password);
