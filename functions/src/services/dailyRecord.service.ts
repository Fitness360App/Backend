// src/services/dailyRecord.service.ts
import { firestore } from 'firebase-admin';
import { DailyRecord } from '../models/dailyRecord.model';
import { generateRegisterID } from '../utils/idGenerator'; // Asegúrate de importar la función para generar IDs
import { formatDateToDDMMYYYY } from '../utils/dateUtils';
import { convertStepsToKcal } from '../utils/caloriesUtils';

export class DailyRecordService {
    private dailyRecordCollection = firestore().collection('dailyRegister');

    // Método para crear un registro diario vacío

    //TODO: El date tiene que entrar como parámetro
    async createEmptyDailyRecord(uid: string, date: string): Promise<void> {  //ESTO ES TEMPORAL, EL INPUT DEBE SER UN DATE()
        const formattedDate = date
        //const formattedDate = formatDateToDDMMYYYY(new Date()); // Formatear la fecha a dd/mm/yyyy

        // Verificar si el registro ya existe
        const exists = await this.recordExists(uid, formattedDate);
        if (exists) {
            throw new Error(`Ya existe un registro diario para la fecha ${formattedDate}`);
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
                throw new Error(`Error al crear el registro diario: ${error.message}`);
            } else {
                throw new Error('Error desconocido al crear el registro diario');
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
            throw new Error(`No se encontró un registro diario para la fecha ${formattedDate}`);
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
            throw new Error(`No se encontró un registro diario para la fecha ${formattedDate}`);
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
            throw new Error(`No se encontró un registro diario para la fecha ${formattedDate}`);
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
            throw new Error(`No se encontró un registro diario para la fecha ${formattedDate}`);
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


}