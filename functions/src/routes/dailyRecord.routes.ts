// src/routes/dailyRecord.routes.ts
import { Router } from 'express';
import { DailyRecordController } from '../controllers/dailyRecord.controller';

const router = Router();
const dailyRecordController = new DailyRecordController();

// Ruta para crear un registro diario vacío
router.post('/create', (req, res) => dailyRecordController.createEmptyRecord(req, res));

// Ruta para comprobar si existe un registro diario
router.get('/check', (req, res) => dailyRecordController.checkRecordExists(req, res));

// Ruta para obtener el dailyRecord del usuario
router.get('/getdailyRecord/:uid/:date', (req, res) => dailyRecordController.getDailyRecord(req, res));

// Ruta para actualizar los pasos
router.put('/updateSteps', dailyRecordController.updateSteps);

// Ruta para actualizar las calorías quemadas
router.put('/updateBurnedKcals', dailyRecordController.updateBurnedKcals);

router.post('/updateBurnedKcalsFromSteps', dailyRecordController.updateBurnedKcalsFromSteps);

router.post('/updateNutrients', dailyRecordController.updateNutrients)

export default router;