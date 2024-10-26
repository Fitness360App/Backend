// src/services/dailyRecord.service.ts
import { firestore } from 'firebase-admin';
import { DailyRecord } from '../models/dailyRecord.model';
import { generateRegisterID } from '../utils/idGenerator'; // Asegúrate de importar la función para generar IDs
import { formatDateToDDMMYYYY } from '../utils/dateUtils';
import { convertStepsToKcal } from '../utils/caloriesUtils';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';
import { DailyRecordException } from '../utils/exceptions/DailyRecordException';
import { MealService } from './meal.service';

export class DailyRecordService {
    private dailyRecordCollection = firestore().collection('dailyRegister');
    private mealService: MealService;

    constructor() {
        this.mealService = new MealService();
    }


    // Método para crear un registro diario vacío

    //TODO: El date tiene que entrar como parámetro
    async createEmptyDailyRecord(uid: string, date: string): Promise<void> {  //ESTO ES TEMPORAL, EL INPUT DEBE SER UN DATE()
        const formattedDate = date
        //const formattedDate = formatDateToDDMMYYYY(new Date()); // Formatear la fecha a dd/mm/yyyy

        // Verificar si el registro ya existe
        const exists = await this.recordExists(uid, formattedDate);
        if (exists) {
            throw new DailyRecordException(`Ya existe un registro diario para la fecha ${formattedDate}`);
        }

        const emptyRecord: DailyRecord = {
            registerID: generateRegisterID(), // Genera un nuevo ID para el registro
            uid: uid,                         // ID del usuario
            date: formattedDate,                 // Fecha del registro
            nutrients: {                      // Inicializa los nutrientes a cero
                consumedCarbs: 0,
                consumedProteins: 0,
                consumedFats: 0,
                consumedKcals: 0,
            },
            steps: 0,                        // Inicializa pasos a 0
            burnedKcals: 0,                 // Inicializa calorías quemadas a 0
        };

        try {
            await this.dailyRecordCollection.add(emptyRecord); // Guarda el registro en Firestore
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new DailyRecordException(`Error al crear el registro diario: ${error.message}`);
            } else {
                throw new UnknownErrorException('Error desconocido al crear el registro diario');
            }
        }
    }

    // Método para verificar si existe un registro para una fecha específica
    async recordExists(uid: string, date: string): Promise<boolean> {

        // Consultar Firestore usando cadenas
        const snapshot = await this.dailyRecordCollection
            .where('uid', '==', uid)
            .where('date', '==', date)
            .get();
    
        // Retornar verdadero si hay documentos, falso en caso contrario
        return !snapshot.empty;
    }

    // Método para obtener las macros del usuario para una fecha específica
    //ESTO ES TEMPORAL, EL INPUT DEBE SER UN DATE()
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
        const formattedDate = date;
        //const formattedDate = formatDateToDDMMYYYY(fecha); // Formatear la fecha a dd/mm/yyyy

        // Consultar Firestore para obtener el registro del usuario
        const snapshot = await this.dailyRecordCollection
            .where('uid', '==', uid)
            .where('date', '==', formattedDate)
            .get();

        if (snapshot.empty) {
            throw new DailyRecordException(`No se encontró un registro diario para la fecha ${formattedDate}`);
        }

        // Asumir que hay un solo registro por fecha
        const record = snapshot.docs[0].data() as DailyRecord;

        // Retornar las macros
        return {
            registerID: record.registerID,
            nutrients: {
                consumedCarbs: record.nutrients.consumedCarbs,
                consumedProteins: record.nutrients.consumedProteins,
                consumedFats: record.nutrients.consumedFats,
                consumedKcals: record.nutrients.consumedKcals,
            },
            steps: record.steps,
            burnedKcals: record.burnedKcals,
        };
    }

    //ESTO ES TEMPORAL, EL INPUT DEBE SER UN DATE()
    async updateSteps(uid: string, date: string, steps: number): Promise<void> {
        const formattedDate = date; // Suponemos que `date` ya está en formato dd/mm/yyyy

        // Consultar Firestore para obtener el registro del usuario
        const snapshot = await this.dailyRecordCollection
            .where('uid', '==', uid)
            .where('date', '==', formattedDate)
            .get();

        if (snapshot.empty) {
            throw new DailyRecordException(`No se encontró un registro diario para la fecha ${formattedDate}`);
        }

        // Asumir que hay un solo registro por fecha
        const recordRef = snapshot.docs[0].ref;

        // Actualizar los pasos sumando los nuevos pasos
        await recordRef.update({
            steps: firestore.FieldValue.increment(steps) // Sumar los pasos
        });
    }

    // Método para actualizar las calorías quemadas de un registro diario
    async updateBurnedKcals(uid: string, date: string, burnedKcals: number): Promise<void> {
        const formattedDate = date; // Suponemos que `date` ya está en formato dd/mm/yyyy

        // Consultar Firestore para obtener el registro del usuario
        const snapshot = await this.dailyRecordCollection
            .where('uid', '==', uid)
            .where('date', '==', formattedDate)
            .get();

        if (snapshot.empty) {
            throw new DailyRecordException(`No se encontró un registro diario para la fecha ${formattedDate}`);
        }

        // Asumir que hay un solo registro por fecha
        const recordRef = snapshot.docs[0].ref;

        // Actualizar las calorías quemadas sumando las nuevas calorías
        await recordRef.update({
            burnedKcals: firestore.FieldValue.increment(burnedKcals) // Sumar las calorías quemadas
        });
    }

    // Método para actualizar las calorías quemadas basado en los pasos
    async updateBurnedKcalsFromSteps(uid: string, date: string, steps: number): Promise<void> {
        const formattedDate = date; // Suponemos que `date` ya está en formato dd/mm/yyyy

        // Consultar Firestore para obtener el registro del usuario
        const snapshot = await this.dailyRecordCollection
            .where('uid', '==', uid)
            .where('date', '==', formattedDate)
            .get();

        if (snapshot.empty) {
            throw new DailyRecordException(`No se encontró un registro diario para la fecha ${formattedDate}`);
        }

        // Asumir que hay un solo registro por fecha
        const recordRef = snapshot.docs[0].ref;

        // Convertir pasos a calorías
        const burnedKcals = convertStepsToKcal(steps);

        // Actualizar las calorías quemadas
        await recordRef.update({
            burnedKcals: firestore.FieldValue.increment(burnedKcals) // Sumar las calorías quemadas
        });
    }










    // Actualiza los nutrientes consumidos en el registro diario
    async updateProcess(uid: string): Promise<void> {

        // Inicializar variables para los nutrientes
        let totalKcals = 0;
        let totalCarbs = 0;
        let totalProteins = 0;
        let totalFats = 0;

        // Definir los tipos de comidas que vamos a procesar
        const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner', 'extras'] as const;

        // Recorrer cada tipo de comida y obtener el meal correspondiente
        for (const mealType of mealTypes) {
            try {
                const meal = await this.mealService.getMeal(uid, mealType);
        
                // Verificar si meal es null o undefined
                if (meal && meal.foods) { // Asegúrate de que meal y meal.foods no sean nulos
                    // Recorrer cada alimento en el meal y calcular nutrientes
                    for (const food of meal.foods) {
                        // Acceder a los nutrientes dentro de `food.nutrients`
                        const nutrients = await this.calculateProportionalNutrients(food.nutrients, food.servingSize);
        
                        // Acumular los nutrientes en total
                        totalKcals += nutrients.kcals;
                        totalCarbs += nutrients.carbs;
                        totalProteins += nutrients.proteins;
                        totalFats += nutrients.fats;
                    }
                } else {
                    console.log(`No se encontraron alimentos para el tipo de comida: ${mealType} para el usuario ${uid}`);
                }
            } catch (error) {
                // Manejar la excepción aquí
                if (error instanceof Error) {
                    // Aquí puedes acceder a las propiedades del Error
                    console.log(`No se pudo obtener la comida de tipo ${mealType} para el usuario ${uid}: ${error.message}`);
                } else {
                    // Si el error no es una instancia de Error, puedes manejarlo aquí
                    console.log(`Se produjo un error inesperado: ${error}`);
                }
            }
        }

        // Actualizar el registro diario con los nutrientes calculados
        const snapshot = await this.dailyRecordCollection
            .where('uid', '==', uid)
            .get();


        const recordRef = snapshot.docs[0].ref;

        // Actualizar el registro con los nutrientes calculados
        await recordRef.update({
            'nutrients.consumedKcals': totalKcals,
            'nutrients.consumedCarbs': totalCarbs,
            'nutrients.consumedProteins': totalProteins,
            'nutrients.consumedFats': totalFats
        });
    }

    // Asegúrate de que la función `calculateProportionalNutrients` también está correctamente definida
    async calculateProportionalNutrients(food: { kcals: number; carbs: number; proteins: number; fats: number }, servingSize: number) {
        const factor = servingSize / 100; // Proporción en base a 100g
        return {
            kcals: food.kcals * factor,
            carbs: food.carbs * factor,
            proteins: food.proteins * factor,
            fats: food.fats * factor
        };
    }

}