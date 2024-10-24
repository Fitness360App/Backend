// src/controllers/dailyRecord.controller.ts
import { DailyRecordService } from '../services/dailyRecord.service';
import { InternalException } from '../utils/exceptions/InternalException';
import { ValidationException } from '../utils/exceptions/passwordValidateException';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';

export class DailyRecordController {
    private dailyRecordService: DailyRecordService;

    constructor() {
        this.dailyRecordService = new DailyRecordService();
    }

    // Método para crear un registro diario vacío
    createEmptyRecord = async (req: any, res: any) => {
        const { uid, date } = req.body; // Obtener el UID del usuario desde el cuerpo de la solicitud

        if (!uid) {
            throw new ValidationException('UID del usuario es requerido');
        }

        try {
            await this.dailyRecordService.createEmptyDailyRecord(uid, date);
            res.status(201).json({ message: 'Registro diario vacío creado exitosamente' });
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalException(error.message);
            } else {
                throw new UnknownErrorException('Error desconocido al crear el registro diario');
            }
        }
    };

    // Método para comprobar si existe un registro diario para una fecha dada
    checkRecordExists = async (req: any, res: any) => {
        const { uid, date } = req.body; // Obtener UID del usuario y fecha desde el cuerpo de la solicitud

        if (!uid) {
            throw new ValidationException('UID del usuario es requerido');
        }

        if (!date) {
            throw new ValidationException('La fecha es requerida en formato dd/mm/yyyy');
        }

        try {
            const exists = await this.dailyRecordService.recordExists(uid, date);
            res.status(200).json({ exists }); // Devuelve verdadero o falso
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalException(error.message);
            } else {
                throw new UnknownErrorException('Error desconocido al comprobar el registro diario');
            }
        }
    };

    // Método para obtener el dailyRecord del usuario
    getDailyRecord = async (req: any, res: any) => {
        const { uid, date } = req.body; // Obtener UID del usuario y fecha desde el cuerpo de la solicitud

        if (!uid) {
            throw new ValidationException('UID del usuario es requerido');
        }

        if (!date) {
            throw new ValidationException('La fecha es requerida en formato dd/mm/yyyy');
        }

        try {
            const macros = await this.dailyRecordService.getDailyRecord(uid, date); // Convertir a objeto Date
            res.status(200).json(macros); // Devuelve las macros
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalException(error.message);
            } else {
                throw new UnknownErrorException('Error desconocido al obtener las macros del usuario');     
            }
        }
    };


    updateSteps = async (req: any, res: any) => {
        const { uid, date, steps } = req.body; // Obtener UID del usuario, fecha y pasos desde el cuerpo de la solicitud

        if (!uid) {
            throw new ValidationException('UID del usuario es requerido');
        }

        if (!date) {
            throw new ValidationException('La fecha es requerida en formato dd/mm/yyyy');
        }

        if (steps === undefined) {
            throw new ValidationException('El número de pasos es requerido');
        }

        try {
            await this.dailyRecordService.updateSteps(uid, date, steps); // Llama al servicio para actualizar los pasos
            res.status(200).json({ message: 'Pasos actualizados exitosamente' });
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalException(error.message);
            } else {
                throw new UnknownErrorException('Error desconocido al actualizar los pasos');
            }
        }
    };


    // Método para actualizar las calorías quemadas del registro diario
    updateBurnedKcals = async (req: any, res: any) => {
        const { uid, date, burnedKcals } = req.body; // Obtener UID del usuario, fecha y calorías quemadas desde el cuerpo de la solicitud

        if (!uid) {
            throw new ValidationException('UID del usuario es requerido');
        }

        if (!date) {
            throw new ValidationException('La fecha es requerida en formato dd/mm/yyyy');
        }

        if (burnedKcals === undefined) {
            throw new ValidationException('El número de calorías quemadas es requerido');
        }

        try {
            await this.dailyRecordService.updateBurnedKcals(uid, date, burnedKcals); // Llama al servicio para actualizar las calorías quemadas
            res.status(200).json({ message: 'Calorías quemadas actualizadas exitosamente' });
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalException(error.message);
            } else {
                throw new UnknownErrorException('Error desconocido al actualizar las calorías quemadas');
            }
        }
    };


    // Método para actualizar las calorías quemadas a partir de los pasos
    updateBurnedKcalsFromSteps = async (req: any, res: any) => {
        const { uid, date, steps } = req.body; // Obtener UID del usuario, fecha y pasos desde el cuerpo de la solicitud

        if (!uid) {
            throw new ValidationException('UID del usuario es requerido');
        }

        if (!date) {
            throw new ValidationException('La fecha es requerida en formato dd/mm/yyyy');
        }

        if (steps == null) {
            throw new ValidationException('El número de pasos es requerido');
        }

        try {
            await this.dailyRecordService.updateBurnedKcalsFromSteps(uid, date, steps);
            res.status(200).json({ message: 'Calorías quemadas actualizadas exitosamente' });
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalException(error.message);
            } else {
                throw new UnknownErrorException('Error desconocido al actualizar las calorías quemadas');
            }
        }
    };

    
}
