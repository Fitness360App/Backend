// src/services/dailyRecord.service.ts
//import { DailyRecord } from '../models/dailyRecord.model';
import { generateRegisterID } from '../utils/idGenerator'; // Asegúrate de importar la función para generar IDs
import { formatDateToDDMMYYYY } from '../utils/dateUtils';
import { convertStepsToKcal } from '../utils/caloriesUtils';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';
import { DailyRecordException } from '../utils/exceptions/DailyRecordException';
import {  UserNotFoundException } from "../utils/exceptions/userNotFoundException";

import { AppDataSource } from "../ormconfig";
import { DailyRecord2 } from "../entity/dailryRecord";
import { User2 } from "../entity/User";
import { v4 as uuidv4 } from 'uuid';

export class DailyRecordService {


    async recordExists(uid: string, date: string): Promise<boolean> {
        // Obtén el repositorio de DailyRecord
        const dailyRecordRepository = AppDataSource.getRepository(DailyRecord2);
    
        // Consulta la base de datos para verificar si ya existe un registro para el usuario y la fecha especificada
        const record = await dailyRecordRepository.findOneBy({ uid, date });
    
        // Retorna verdadero si se encontró un registro, falso en caso contrario
        return !!record;
    }


    async getDailyRecord(uid: string, date: string): Promise<{
        registerID: string;
        nutrients: {
            consumedCarbs: number;
            consumedProteins: number;
            consumedFats: number;
            consumedKcals: number;
        };
        steps: number;
        burnedKcals: number;
    } | null> {
        const formattedDate = date; // Usa la fecha tal cual o formatea si es necesario
    
        // Obtén el repositorio de DailyRecord
        const dailyRecordRepository = AppDataSource.getRepository(DailyRecord2);
    
        // Consulta para obtener el registro del usuario por uid y fecha
        const record = await dailyRecordRepository.findOneBy({ uid, date: formattedDate });
    
        if (!record) {
            throw new DailyRecordException(`No se encontró un registro diario para la fecha ${formattedDate}`);
        }
    
        // Retornar el registro con los campos necesarios
        return {
            registerID: record.registerID,
            nutrients: {
                consumedCarbs: record.consumedCarbs,
                consumedProteins: record.consumedProteins,
                consumedFats: record.consumedFats,
                consumedKcals: record.consumedKcals,
            },
            steps: record.steps,
            burnedKcals: record.burnedKcals,
        };
    }
    



    async createEmptyDailyRecord(uid: string, date: string): Promise<void> {
        // Usa la fecha recibida directamente o formatea la fecha actual
        const formattedDate = date;
    
        // Verificar si el usuario existe
        const userRepository = AppDataSource.getRepository(User2);
        const userExists = await userRepository.findOneBy({ uid });
    
        if (!userExists) {
            throw new UserNotFoundException(`El usuario con ID ${uid} no existe`);
        }
    
        // Verificar si el registro diario ya existe para esta fecha
        const recordExists = await this.recordExists(uid, formattedDate);
        if (recordExists) {
            throw new DailyRecordException(`Ya existe un registro diario para la fecha ${formattedDate}`);
        }
    
        // Crear un registro diario vacío
        const dailyRecordRepository = AppDataSource.getRepository(DailyRecord2);
        const emptyRecord = dailyRecordRepository.create({
            registerID: uuidv4(), // Genera un nuevo UUID para el registro
            uid: uid,
            date: formattedDate,
            consumedCarbs: 0,
            consumedProteins: 0,
            consumedFats: 0,
            consumedKcals: 0,
            steps: 0,
            burnedKcals: 0,
        });
    
        try {
            // Guarda el registro en la base de datos
            await dailyRecordRepository.save(emptyRecord);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DailyRecordException(`Error al crear el registro diario: ${error.message}`);
            } else {
                throw new UnknownErrorException('Error desconocido al crear el registro diario');
            }
        }
        }



    async updateSteps(uid: string, date: string, steps: number): Promise<void> {
        const formattedDate = date; // Usa la fecha directamente o formatea si es necesario
    
        // Obtén el repositorio de DailyRecord
        const dailyRecordRepository = AppDataSource.getRepository(DailyRecord2);
    
        // Busca el registro diario del usuario para la fecha específica
        const record = await dailyRecordRepository.findOneBy({ uid, date: formattedDate });
    
        // Si no se encuentra el registro, lanza una excepción
        if (!record) {
            throw new DailyRecordException(`No se encontró un registro diario para la fecha ${formattedDate}`);
        }
    
        // Actualiza los pasos sumando el nuevo valor al actual
        record.steps += steps;
    
        try {
            // Guarda los cambios en la base de datos
            await dailyRecordRepository.save(record);
        } catch (error: unknown) {
            throw new DailyRecordException(`Error al actualizar los pasos: ${(error as Error).message}`);
        }
    }


    async updateBurnedKcals(uid: string, date: string, burnedKcals: number): Promise<void> {
        const formattedDate = date; // Usa la fecha directamente o formatea si es necesario
    
        // Obtén el repositorio de DailyRecord
        const dailyRecordRepository = AppDataSource.getRepository(DailyRecord2);
    
        // Busca el registro diario del usuario para la fecha específica
        const record = await dailyRecordRepository.findOneBy({ uid, date: formattedDate });
    
        // Si no se encuentra el registro, lanza una excepción
        if (!record) {
            throw new DailyRecordException(`No se encontró un registro diario para la fecha ${formattedDate}`);
        }
    
        // Actualiza las calorías quemadas sumando el nuevo valor al actual
        record.burnedKcals += burnedKcals;
    
        try {
            // Guarda los cambios en la base de datos
            await dailyRecordRepository.save(record);
        } catch (error: unknown) {
            throw new DailyRecordException(`Error al actualizar las calorías quemadas: ${(error as Error).message}`);
        }
    }

    async updateBurnedKcalsFromSteps(uid: string, date: string, steps: number): Promise<void> {
        const formattedDate = date; // Usa la fecha directamente o formatea si es necesario
    
        // Obtén el repositorio de DailyRecord
        const dailyRecordRepository = AppDataSource.getRepository(DailyRecord2);
    
        // Busca el registro diario del usuario para la fecha específica
        const record = await dailyRecordRepository.findOneBy({ uid, date: formattedDate });
    
        // Si no se encuentra el registro, lanza una excepción
        if (!record) {
            throw new DailyRecordException(`No se encontró un registro diario para la fecha ${formattedDate}`);
        }
    
        // Convertir pasos a calorías
        const burnedKcals = convertStepsToKcal(steps);
    
        // Actualizar las calorías quemadas sumando el nuevo valor al actual
        record.burnedKcals += burnedKcals;
    
        try {
            // Guarda los cambios en la base de datos
            await dailyRecordRepository.save(record);
        } catch (error: unknown) {
            throw new DailyRecordException(`Error al actualizar las calorías quemadas desde pasos: ${(error as Error).message}`);
        }
    }


}