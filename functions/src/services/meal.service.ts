import { firestore } from 'firebase-admin';
import { Meal } from '../models/meal.model';
import { generateMealID } from '../utils/idGenerator';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';
import { FoodService } from './food.service';
import { MealException } from '../utils/exceptions/mealException';
import { InternalException } from '../utils/exceptions/InternalException';

//import { MealException } from '../utils/exceptions/mealException';

export class MealService {
    private mealCollection = firestore().collection('meals');
    private foodService = new FoodService();


    // Método para verificar si ya existe un Meal del mismo tipo para un usuario
    async mealExists(uid: string, type: string): Promise<boolean> {
        const snapshot = await this.mealCollection
            .where('uid', '==', uid)
            .where('type', '==', type)
            .get();

        return !snapshot.empty;
    }


    async addFoodToMeal(
        barcode: string,
        userId: string,
        mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extras',
        servingSize: number
    ): Promise<void> {
        const validMealTypes = ['breakfast', 'lunch', 'snack', 'dinner', 'extras'];
        if (!validMealTypes.includes(mealType)) {
            throw new MealException(`Tipo de comida no válido: ${mealType}.`);
        }
    
        try {
            // Verificar si ya existe un meal del tipo especificado para el usuario
            const mealSnapshot = await this.mealCollection
                .where('uid', '==', userId)
                .where('type', '==', mealType)
                .get();
    
            let mealId: string;
            let foods: any[] = [];

            if (mealSnapshot.empty) {
                // Si no existe el meal, lo crea
                mealId = generateMealID();
                const newMeal: Meal = {
                    id: mealId,
                    type: mealType,
                    foods: [],
                    uid: userId
                };
                await this.mealCollection.doc(mealId).set(newMeal);
            } else {
                // Si el meal existe, obtiene su ID y los alimentos actuales
                mealId = mealSnapshot.docs[0].id;
                const mealData = mealSnapshot.docs[0].data();
                foods = mealData.foods || [];
            }
    
            // Verificar si el alimento ya existe en el meal
            const foodExists = foods.some((food: any) => food.barcode === barcode);
            if (foodExists) {
                throw new MealException(`El alimento con código de barras ${barcode} ya existe en el meal de tipo ${mealType}.`);
            }
    
            // Recuperar el alimento por el código de barras
            const food = await this.foodService.searchFoodByBarcode(barcode);
            if (!food) {
                throw new MealException(`No se encontró un alimento con código de barras ${barcode}.`);
            }
    
            // Agregar el alimento al meal
            await this.mealCollection.doc(mealId).update({
                foods: firestore.FieldValue.arrayUnion({ ...food, servingSize })
            });
    
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalException(`Error adding food to meal: ${error.message}`);
            } else {
                throw new UnknownErrorException('Unknown error adding food to meal.');
            }
        }
    }
    

    async removeFoodFromMeal(
        barcode: string,
        userId: string,
        mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extras'
    ): Promise<void> {
        try {
            // Verificar si existe un meal del tipo especificado para el usuario
            const mealSnapshot = await this.mealCollection
                .where('uid', '==', userId)
                .where('type', '==', mealType)
                .get();
    
            if (mealSnapshot.empty) {
                throw new MealException(`No existe un meal de tipo ${mealType} para el usuario ${userId}.`);
            }
    
            const mealId = mealSnapshot.docs[0].id;
    
            // Obtener el documento del meal actual
            const mealDoc = await this.mealCollection.doc(mealId).get();
            const mealData = mealDoc.data();
    
            if (!mealData || !mealData.foods || mealData.foods.length === 0) {
                throw new MealException('No se encontraron alimentos en el meal.');
            }


            // Filtrar el alimento a eliminar
            const updatedFoods = mealData.foods.filter((food: any) => food.barcode !== barcode);
    
            // Actualizar el documento del meal con el nuevo array de alimentos
            await this.mealCollection.doc(mealId).update({
                foods: updatedFoods
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalException(`Error removing food from meal: ${error.message}`);
            } else {
                throw new UnknownErrorException('Unknown error removing food from meal.');
            }
        }
    }


    async editFoodFromMeal(
        barcode: string,
        userId: string,
        mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extras',
        newSize: number // Suponiendo que el tamaño de la porción es un número
    ): Promise<void> {
        try {
            // Verificar si existe un meal del tipo especificado para el usuario
            const mealSnapshot = await this.mealCollection
                .where('uid', '==', userId)
                .where('type', '==', mealType)
                .get();
    
            if (mealSnapshot.empty) {
                throw new MealException(`No existe un meal de tipo ${mealType} para el usuario ${userId}.`);
            }
    
            const mealId = mealSnapshot.docs[0].id;
    
            // Obtener el documento del meal actual
            const mealDoc = await this.mealCollection.doc(mealId).get();
            const mealData = mealDoc.data();
    
            // Comprobar si no hay alimentos
            if (!mealData || !mealData.foods || mealData.foods.length === 0) {
                throw new MealException('No se encontraron alimentos en el meal.');
            }
    
            // Buscar el alimento con el código de barras proporcionado
            const foodIndex = mealData.foods.findIndex((food: any) => food.barcode === barcode);
    
            // Verificar si se encontró el alimento
            if (foodIndex === -1) {
                throw new MealException(`No se encontró el alimento con código de barras ${barcode} en el meal.`);
            }
    
            // Actualizar el tamaño de la porción del alimento
            mealData.foods[foodIndex].servingSize = newSize;
    
            // Actualizar el documento del meal con el nuevo array de alimentos
            await this.mealCollection.doc(mealId).update({
                foods: mealData.foods
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalException(`Error editing food in meal: ${error.message}`);
            } else {
                throw new UnknownErrorException('Unknown error editing food in meal.');
            }
        }
    }



    async getMeal(
        userId: string,
        mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extras'
    ): Promise<Meal | null> {
        try {
            // Consultar Firestore para obtener el meal correspondiente
            const mealSnapshot = await this.mealCollection
                .where('uid', '==', userId)
                .where('type', '==', mealType)
                .get();

            // Verificar si el meal existe
            if (mealSnapshot.empty) {
                throw new MealException(`No existe un meal de tipo ${mealType} para el usuario ${userId}.`);
            }

            // Obtener los datos del meal
            const mealData = mealSnapshot.docs[0].data() as Meal;
            return mealData;

        } catch (error) {
            if (error instanceof Error) {
                throw new InternalException(`Error al obtener el meal: ${error.message}`);
            } else {
                throw new UnknownErrorException('Error desconocido al obtener el meal.');
            }
        }
    }



























}