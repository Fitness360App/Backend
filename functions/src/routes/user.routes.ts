import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

// Ruta para obtener los datos del usuario por ID
router.get('/getUser', userController.getUserDataByID);  // Añadimos una ruta que recibe el ID del usuario en la URL

// Ruta para obtener solo los objetivos del usuario
router.get('/getUserGoals', userController.getUserGoals); // Añadimos esta línea

router.put('/modifyUserData', userController.modifyUserData);  // Añadimos una ruta para modificar los datos del usuario

router.put('/modifyUserGoals', userController.modifyUserGoals);

export default router;
