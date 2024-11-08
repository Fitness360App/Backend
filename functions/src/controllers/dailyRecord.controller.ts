// src/controllers/dailyRecord.controller.ts
import { DailyRecordService } from '../services/dailyRecord.service';
import { UserService } from '../services/user.service';

import { convertToDatabaseDate } from '../utils/dateUtils';

export class DailyRecordController {
    private dailyRecordService: DailyRecordService;
    private userService: UserService;

    constructor() {
        this.dailyRecordService = new DailyRecordService();
        this.userService = new UserService();
    }

    // Método para crear un registro diario vacío
    createEmptyRecord = async (req: any, res: any) => {
        const { uid, date } = req.body;

        if (!uid) { 
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }
        if (!date) {
            return res.status(400).json({ message: 'La fecha es requerida en formato dd/mm/yyyy' });
        } 
 
        // Convertir la fecha al formato `YYYY-MM-DD`
        const formattedDate = convertToDatabaseDate(date);

        try {
            await this.dailyRecordService.createEmptyDailyRecord(uid, formattedDate);
            return res.status(201).json({ message: 'Registro diario vacío creado exitosamente' });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Error desconocido al crear el registro diario' });
            }
        }
    };

    // Método para comprobar si existe un registro diario para una fecha dada
    checkRecordExists = async (req: any, res: any) => {
        const { uid, date } = req.body;
    
        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }
    
        if (!date) {
            return res.status(400).json({ message: 'La fecha es requerida en formato dd/mm/yyyy' });
        }
    
        // Convertir la fecha al formato `YYYY-MM-DD`
        const formattedDate = convertToDatabaseDate(date);
    
        try {
            const exists = await this.dailyRecordService.recordExists(uid, formattedDate);
            return res.status(200).json({ exists }); // Devuelve verdadero o falso
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Error desconocido al comprobar el registro diario' });
            }
        }
    };

    // Método para obtener el dailyRecord del usuario
    getDailyRecord = async (req: any, res: any) => {
        const { uid, date } = req.params;
    
        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }
     
        if (!date) {
            return res.status(400).json({ message: 'La fecha es requerida en formato dd/mm/yyyy' });
        }
    
        // Convertir la fecha al formato `YYYY-MM-DD`
        const formattedDate = convertToDatabaseDate(date);
    
        try {
            const macros = await this.dailyRecordService.getDailyRecord(uid, formattedDate);
            return res.status(200).json(macros); // Devuelve las macros
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Error desconocido al obtener el registro diario' });
            }
        }
    };



    updateSteps = async (req: any, res: any) => {
        const { uid, date, steps } = req.body;
    
        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }
    
        if (!date) {
            return res.status(400).json({ message: 'La fecha es requerida en formato dd/mm/yyyy' });
        }
    
        if (steps === undefined) {
            return res.status(400).json({ message: 'El número de pasos es requerido' });
        }
    
        // Convertir la fecha al formato `YYYY-MM-DD`
        const formattedDate = convertToDatabaseDate(date);
    
        try {
            await this.dailyRecordService.updateSteps(uid, formattedDate, steps);
            return res.status(200).json({ message: 'Pasos actualizados exitosamente' });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Error desconocido al actualizar los pasos' });
            }
        }
    };
    


    // Método para actualizar las calorías quemadas del registro diario
    updateBurnedKcals = async (req: any, res: any) => {
        const { uid, date, burnedKcals } = req.body;
    
        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }
    
        if (!date) {
            return res.status(400).json({ message: 'La fecha es requerida en formato dd/mm/yyyy' });
        }
    
        if (burnedKcals === undefined) {
            return res.status(400).json({ message: 'El número de calorías quemadas es requerido' });
        }
    
        // Convertir la fecha al formato `YYYY-MM-DD`
        const formattedDate = convertToDatabaseDate(date);
    
        try {
            await this.dailyRecordService.updateBurnedKcals(uid, formattedDate, burnedKcals);
            return res.status(200).json({ message: 'Calorías quemadas actualizadas exitosamente' });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Error desconocido al actualizar las calorías quemadas' });
            }
        }
    };


    // Método para actualizar las calorías quemadas a partir de los pasos
    updateBurnedKcalsFromSteps = async (req: any, res: any) => {
        const { uid, date, steps } = req.body;
    
        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }
    
        if (!date) {
            return res.status(400).json({ message: 'La fecha es requerida en formato dd/mm/yyyy' });
        }
    
        if (steps == null) {
            return res.status(400).json({ message: 'El número de pasos es requerido' });
        }
    
        // Convertir la fecha al formato `YYYY-MM-DD`
        const formattedDate = convertToDatabaseDate(date);
    
        try {
            await this.dailyRecordService.updateBurnedKcalsFromSteps(uid, formattedDate, steps);
            return res.status(200).json({ message: 'Calorías quemadas actualizadas exitosamente' });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            } else {
                return res.status(500).json({ message: 'Error desconocido al actualizar las calorías quemadas' });
            }
        }
    };


    updateNutrients = async (req: any, res: any) => {
        const { uid } = req.body;

        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }

        try {
            await this.dailyRecordService.updateProcess(uid);
            return res.status(200).json({ message: 'Progreso actualizado correctamente' });
        } catch (error) {
            return res.status(500).json({ message: error instanceof Error ? error.message : 'Error desconocido ocurrió' });
        }
    };
    
}