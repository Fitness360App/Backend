import * as functions from 'firebase-functions';
import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.routes';
import foodRoutes from './routes/food.routes';
import calculatorRoutes from './routes/calculator.routes';
import userRoutes from './routes/user.routes';
import dailyRecordRoutes from './routes/dailyRecord.routes';
import mealRoutes from './routes/meal.routes';

const app = express();
app.use(bodyParser.json());

// Usar las rutas de autenticación
app.use('/api/auth', authRoutes);


app.use('/api/food', foodRoutes);

app.use('/api/calculator', calculatorRoutes);

app.use('/api/users', userRoutes);

app.use('/api/dailyRecord', dailyRecordRoutes);

app.use('/api/meal', mealRoutes);

// Opción de escuchar en un puerto local para pruebas (opcional)
const PORT = process.env.PORT || 3000; // Puedes usar cualquier puerto que desees
if (process.env.NODE_ENV !== 'production') { // Solo en desarrollo
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
}



// Exportar la función de Firebase
export const api = functions.https.onRequest(app);
