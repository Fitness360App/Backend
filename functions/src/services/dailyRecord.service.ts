// src/services/dailyRecord.service.ts
import { firestore } from 'firebase-admin';
import { DailyRecord } from '../models/dailyRecord.model';
import { generateRegisterID } from '../utils/idGenerator'; // Asegúrate de importar la función para generar IDs
import { formatDateToDDMMYYYY } from '../utils/dateUtils';

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
    async getUserMacros(uid: string, date: string): Promise<{ carbs: number; proteins: number; fats: number; kcals: number } | null> {
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
            carbs: record.nutrients.consumedCarbs,
            proteins: record.nutrients.consumedProteins,
            fats: record.nutrients.consumedFats,
            kcals: record.nutrients.consumedKcals,
        };
    }
}