import { Router } from 'express';
import calculatorController from '../controllers/calculator.controller';

const router = Router();

router.get('/calculateIMC/:uid', calculatorController.calculateIMCByUserData);

router.get('/calculateMacros/:uid', calculatorController.calculateMacrosByUserData);


export default router;