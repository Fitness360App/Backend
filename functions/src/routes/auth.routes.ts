// functions/src/routes/auth.routes.ts

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.get('/', (req, res) => {
    res.send('Hello World');
});

router.post('/register', authController.register);

export default router;
