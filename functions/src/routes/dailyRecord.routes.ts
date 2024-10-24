// src/routes/dailyRecord.routes.ts
import { Router } from 'express';
import { DailyRecordController } from '../controllers/dailyRecord.controller';

const router = Router();
const dailyRecordController = new DailyRecordController();

// Ruta para crear un registro diario vacío
router.post('/create', dailyRecordController.createEmptyRecord); // Cambia el endpoint según sea necesario
router.get('/check', dailyRecordController.checkRecordExists);
router.get('/macros', (req, res) => dailyRecordController.getUserMacros(req, res));

export default router;
