import { Router } from 'express';
import calculatorController from '../controllers/calculator.controller';

const router = Router();

router.get('/calculateIMC', calculatorController.calculateIMCByUserData);

router.get('/calculateMacros', calculatorController.calculateMacrosByUserData);


export default router;