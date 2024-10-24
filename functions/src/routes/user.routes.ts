import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

// Ruta para obtener los datos del usuario por ID
router.get('/:id', userController.getUserDataByID);  // Añadimos una ruta que recibe el ID del usuario en la URL

// Ruta para obtener solo los objetivos del usuario
router.get('/:id/goals', userController.getUserGoals); // Añadimos esta línea


export default router;
