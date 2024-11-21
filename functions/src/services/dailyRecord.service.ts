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
import { Meal2 } from "../entity/meal";
import { User2 } from "../entity/User";
import { v4 as uuidv4 } from 'uuid';
import { MealFood } from "../entity/mealfood";
import { MealService } from './meal.service';

export class DailyRecordService {

    private mealRepository = AppDataSource.getRepository(Meal2);
    private dailyRecordRepository = AppDataSource.getRepository(DailyRecord2);
    private mealService = new MealService();


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
    
        console.log("formattedDate", formattedDate);
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

        await this.mealService.deleteAllMeals(uid);
    
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


    async updateProcess(uid: string, date: string): Promise<void> {
        // Inicializar variables para los nutrientes
        let totalKcals = 0;
        let totalCarbs = 0;
        let totalProteins = 0;
        let totalFats = 0;
    
        // Definir los tipos de comidas que vamos a procesar
        const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
    

        console.log("mealTypes", mealTypes);
        // Repositorios necesarios
        const mealRepository = AppDataSource.getRepository(Meal2);
        const mealFoodRepository = AppDataSource.getRepository(MealFood);
    
        // Recorrer cada tipo de comida y obtener la comida correspondiente
        for (const mealType of mealTypes) {
            try {
                // Obtener la comida del usuario y el tipo de comida
                const meal = await mealRepository.findOne({
                    where: { uid, type: mealType },
                    relations: ['mealFoods', 'mealFoods.food'], // Incluir MealFood y Food2 relacionados
                });
                
    
                console.log(meal);
    
                // Verificar si la comida tiene alimentos
                if (meal && meal.mealFoods.length > 0) {
                    // Recorrer cada relación MealFood en la comida y calcular nutrientes
                    for (const mealFood of meal.mealFoods) {
                        const food = mealFood.food;
    
                        // Calcular nutrientes proporcionados en base al tamaño de la porción
                        const nutrients = this.calculateProportionalNutrients(
                            {
                                kcals: food.kcals,
                                carbs: food.carbs,
                                proteins: food.proteins,
                                fats: food.fats,
                            },
                            mealFood.servingSize // Usar el tamaño de la porción especificado en MealFood
                        );
    
                        // Acumular los nutrientes
                        totalKcals += nutrients.kcals;
                        totalCarbs += nutrients.carbs;
                        totalProteins += nutrients.proteins;
                        totalFats += nutrients.fats;
                    }
                } else {
                    console.log(`No se encontraron alimentos para el tipo de comida: ${mealType} para el usuario ${uid}`);
                }
            } catch (error) {
                console.log(`No se pudo obtener la comida de tipo ${mealType} para el usuario ${uid}: ${error}`);
            }
        }
    
        // Actualizar el registro diario con los nutrientes calculados

        const dailyRecordRepository = AppDataSource.getRepository(DailyRecord2);
        const dailyRecord = await dailyRecordRepository.findOneBy({ uid, date });

    
        if (!dailyRecord) {
            throw new Error(`No se encontró el registro diario para el usuario ${uid}`);
        }
    
        // Actualizar el registro con los nutrientes calculados
        dailyRecord.consumedKcals = totalKcals;
        dailyRecord.consumedCarbs = totalCarbs;
        dailyRecord.consumedProteins = totalProteins;
        dailyRecord.consumedFats = totalFats;
    
        await this.dailyRecordRepository.save(dailyRecord);
    }
    

    // Calcula los nutrientes proporcionados en base a la porción
    calculateProportionalNutrients(
        food: { kcals: number; carbs: number; proteins: number; fats: number },
        servingSize: number
    ) {
        const factor = servingSize / 100; // Proporción en base a 100g
        return {
            kcals: food.kcals * factor,
            carbs: food.carbs * factor,
            proteins: food.proteins * factor,
            fats: food.fats * factor
        };
    }

    // Método para eliminar todas los daily record de un usuario
    async deleteAllDailyRecords(uid: string): Promise<void> {
        try {
            // Obtén el repositorio de DailyRecord
            const dailyRecordRepository = AppDataSource.getRepository(DailyRecord2);
    
            // Elimina todos los registros diarios del usuario
            await dailyRecordRepository.delete({ uid });
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DailyRecordException(`Error al eliminar los registros diarios: ${error.message}`);
            } else {
                throw new UnknownErrorException('Error desconocido al eliminar los registros diarios');
            }
        }
    }



    //Historial de registros diarios
    async getHistory(uid: string, year?: string, month?: string): Promise<DailyRecord2[]> {
        const dailyRecordRepository = AppDataSource.getRepository(DailyRecord2);
    
        // Construir la consulta de acuerdo con los parámetros
        const query = dailyRecordRepository.createQueryBuilder('dailyRecord')
            .where('dailyRecord.uid = :uid', { uid });
    
        if (year) {
            query.andWhere('YEAR(dailyRecord.date) = :year', { year });
        }
    
        if (month) {
            query.andWhere('MONTH(dailyRecord.date) = :month', { month });
        }
    
        try {
            // Ejecutar la consulta y retornar los registros
            const records = await query.getMany();
            return records;
        } catch (error) {
            throw new DailyRecordException(`Error al obtener el historial: ${(error as Error).message}`);
        }
    }


    //Obtener los tres registros con más pasos en una fecha
    async getBestSteps(date: string): Promise<{ name: string; steps: number }[]> {
        const dailyRecordRepository = AppDataSource.getRepository(DailyRecord2);
        const userRepository = AppDataSource.getRepository(User2);
    
        try {
            // Consulta los tres registros con más pasos en la fecha especificada
            const bestSteps = await dailyRecordRepository
                .createQueryBuilder('dailyRecord')
                .where('dailyRecord.date = :date', { date })
                .orderBy('dailyRecord.steps', 'DESC') // Ordenar por pasos en orden descendente
                .limit(3) // Limitar a los tres primeros
                .getMany();
    
            // Mapear los registros para incluir el nombre del usuario
            const result = await Promise.all(
                bestSteps.map(async (record) => {
                    const user = await userRepository.findOneBy({ uid: record.uid });
                    return {
                        name: user?.name || 'Usuario desconocido', // Suponiendo que el modelo de usuario tiene un campo `name`
                        steps: record.steps,
                    };
                })
            );
    
            return result;
        } catch (error) {
            throw new DailyRecordException(`Error al obtener los registros con más pasos: ${(error as Error).message}`);
        }
    }
    
    
    

}