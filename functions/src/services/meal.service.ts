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


    // Function to add a food item to a meal
    async addFoodToMeal(
        barcode: string,
        userId: string,
        mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extras'
    ): Promise<void> {
        // Validar el tipo de comida
        const validMealTypes = ['breakfast', 'lunch', 'snack', 'dinner', 'extras'];
        
        if (!validMealTypes.includes(mealType)) {
            throw new MealException(`Tipo de comida no válido: ${mealType}.`);
        }
    
        try {
            // Check if a meal of the specified type already exists for the user
            const mealExists = await this.mealExists(userId, mealType);
    
            let mealId: string;
            if (!mealExists) {
                // If the meal does not exist, create a new one
                mealId = generateMealID(); // Generate a new ID for the meal
                const newMeal: Meal = {
                    id: mealId,
                    type: mealType,
                    foods: [],
                    uid: userId
                };
                await this.mealCollection.doc(mealId).set(newMeal);
            } else {
                // If the meal exists, get its ID
                const mealSnapshot = await this.mealCollection
                    .where('uid', '==', userId)
                    .where('type', '==', mealType)
                    .get();
    
                if (!mealSnapshot.empty) {
                    mealId = mealSnapshot.docs[0].id;
                } else {
                    throw new MealException('Error retrieving existing meal ID.');
                }
            }
    
            // Retrieve food item by barcode
            const food = await this.foodService.searchFoodByBarcode(barcode);
            if (!food) {
                throw new MealException(`Food item with barcode ${barcode} not found.`);
            }
    
            // Add food item to the meal
            await this.mealCollection.doc(mealId).update({
                foods: firestore.FieldValue.arrayUnion(food)
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalException(`Error adding food to meal: ${error.message}`);
            } else {
                throw new UnknownErrorException('Unknown error adding food to meal.');
            }
        }
    }
}