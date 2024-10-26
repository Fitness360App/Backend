// src/controllers/dailyRecord.controller.ts
import { DailyRecordService } from '../services/dailyRecord.service';
import { InternalException } from '../utils/exceptions/InternalException';
import { ValidationException } from '../utils/exceptions/passwordValidateException';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';
import { UserController } from './user.controller';

export class DailyRecordController {
    private dailyRecordService: DailyRecordService;
    private userController: UserController;

    constructor() {
        this.dailyRecordService = new DailyRecordService();
        this.userController = new UserController();
    }

    // Método para crear un registro diario vacío
    createEmptyRecord = async (req: any, res: any) => {
        const { uid, date } = req.body;
    
        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }
    
        try {
            // Verificar si el usuario existe usando userExists
            const userExists = await this.userController.userExists(uid);
    
            if (!userExists) {
                return res.status(404).json({ message: 'El usuario no existe' });
            }
    
            // Crear el registro diario vacío si el usuario existe
            await this.dailyRecordService.createEmptyDailyRecord(uid, date);
            res.status(201).json({ message: 'Registro diario vacío creado exitosamente' });
            
        } catch (error) {
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error occurred' });
        }
    };

    // Método para comprobar si existe un registro diario para una fecha dada
    checkRecordExists = async (req: any, res: any) => {
        const { uid, date } = req.body; // Obtener UID del usuario y fecha desde el cuerpo de la solicitud

        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }

        if (!date) {
            return res.status(400).json({ message: 'La fecha es requerida en formato dd/mm/yyyy' });
        }

        try {
            // Verificar si el usuario existe
            const userExists = await this.userController.userExists(uid);
            
            if (!userExists) {
                return res.status(404).json({ message: 'El usuario no existe' });
            }

            // Verificar si el registro diario existe para la fecha dada
            const exists = await this.dailyRecordService.recordExists(uid, date);
            res.status(200).json({ exists }); // Devuelve verdadero o falso
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
    };


    // Método para obtener el dailyRecord del usuario
    getDailyRecord = async (req: any, res: any) => {
        const { uid, date } = req.body; // Obtener UID del usuario y fecha desde el cuerpo de la solicitud

        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }

        if (!date) {
            return res.status(400).json({ message: 'La fecha es requerida en formato dd/mm/yyyy' });
        }

        try {
            // Verificar si el usuario existe
            const userExists = await this.userController.userExists(uid);
            
            if (!userExists) {
                return res.status(404).json({ message: 'El usuario no existe' });
            }

            // Obtener el registro diario si el usuario existe
            const macros = await this.dailyRecordService.getDailyRecord(uid, date);
            res.status(200).json(macros); // Devuelve las macros
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
    };



    updateSteps = async (req: any, res: any) => {
        const { uid, date, steps } = req.body; // Obtener UID del usuario, fecha y pasos desde el cuerpo de la solicitud
    
        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }
    
        if (!date) {
            return res.status(400).json({ message: 'La fecha es requerida en formato dd/mm/yyyy' });
        }
    
        if (steps === undefined) {
            return res.status(400).json({ message: 'El número de pasos es requerido' });
        }
    
        try {
            // Verificar si el usuario existe
            const userExists = await this.userController.userExists(uid);
            
            if (!userExists) {
                return res.status(404).json({ message: 'El usuario no existe' });
            }
    
            await this.dailyRecordService.updateSteps(uid, date, steps); // Llama al servicio para actualizar los pasos
            res.status(200).json({ message: 'Pasos actualizados exitosamente' });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
    };
    


    // Método para actualizar las calorías quemadas del registro diario
    updateBurnedKcals = async (req: any, res: any) => {
        const { uid, date, burnedKcals } = req.body; // Obtener UID del usuario, fecha y calorías quemadas desde el cuerpo de la solicitud

        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }

        if (!date) {
            return res.status(400).json({ message: 'La fecha es requerida en formato dd/mm/yyyy' });
        }

        if (burnedKcals === undefined) {
            return res.status(400).json({ message: 'El número de calorías quemadas es requerido' });
        }

        try {
            // Verificar si el usuario existe
            const userExists = await this.userController.userExists(uid);
            
            if (!userExists) {
                return res.status(404).json({ message: 'El usuario no existe' });
            }

            await this.dailyRecordService.updateBurnedKcals(uid, date, burnedKcals); // Llama al servicio para actualizar las calorías quemadas
            res.status(200).json({ message: 'Calorías quemadas actualizadas exitosamente' });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
    };



    // Método para actualizar las calorías quemadas a partir de los pasos
    updateBurnedKcalsFromSteps = async (req: any, res: any) => {
        const { uid, date, steps } = req.body; // Obtener UID del usuario, fecha y pasos desde el cuerpo de la solicitud

        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }

        if (!date) {
            return res.status(400).json({ message: 'La fecha es requerida en formato dd/mm/yyyy' });
        }

        if (steps == null) {
            return res.status(400).json({ message: 'El número de pasos es requerido' });
        }

        try {
            // Verificar si el usuario existe
            const userExists = await this.userController.userExists(uid);
            
            if (!userExists) {
                return res.status(404).json({ message: 'El usuario no existe' });
            }

            await this.dailyRecordService.updateBurnedKcalsFromSteps(uid, date, steps);
            res.status(200).json({ message: 'Calorías quemadas actualizadas exitosamente' });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
    };


    updateNutrients = async (req: any, res: any) => {
        const { uid } = req.body; // Obtener UID del usuario, fecha y pasos desde el cuerpo de la solicitud

        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }

        try {
            // Verificar si el usuario existe
            const userExists = await this.userController.userExists(uid);
            
            if (!userExists) {
                return res.status(404).json({ message: 'El usuario no existe' });
            }

            await this.dailyRecordService.updateProcess(uid);
            res.status(200).json({ message: 'Progreso actualizado correctamente' });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
    };

    
}
