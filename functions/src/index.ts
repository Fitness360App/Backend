import * as functions from 'firebase-functions';
import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.routes';

const app = express();
app.use(bodyParser.json());

// Usar las rutas de autenticación
app.use('/api/auth', authRoutes);

// Opción de escuchar en un puerto local para pruebas (opcional)
const PORT = process.env.PORT || 3000; // Puedes usar cualquier puerto que desees
if (process.env.NODE_ENV !== 'production') { // Solo en desarrollo
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
}


app.get('/', (req, res) => {
    res.send('Hello World');
});

// Exportar la función de Firebase
export const api = functions.https.onRequest(app);
