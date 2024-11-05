import { firestore } from 'firebase-admin';
import { Meal } from '../models/meal.model';
import { generateMealID } from '../utils/idGenerator';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';
import { FoodService } from './food.service';

//import { MealException } from '../utils/exceptions/mealException';

import { AppDataSource } from "../ormconfig";
import { Meal2 } from "../entity/meal";
import { Food2 } from "../entity/food";

export class MealService {
    //private mealCollection = firestore().collection('meals');
    private foodService = new FoodService();



    async mealExists(uid: string, type: string): Promise<boolean> {
        console.log(uid, type);
    
        // Obtén el repositorio de Meal
        const mealRepository = AppDataSource.getRepository(Meal2);
    
        // Busca una comida específica para el usuario y tipo dados
        const meal = await mealRepository.findOneBy({ uid, type: type as Meal["type"] });
    
        // Retorna verdadero si se encuentra la comida, falso en caso contrario
        return !!meal;
    }


    async addFoodToMeal(barcode: string, userId: string, mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extras'): Promise<void> {
        try {
            // Obtén el repositorio de Meal y Food
            const mealRepository = AppDataSource.getRepository(Meal2);
            const foodRepository = AppDataSource.getRepository(Food2);
    
            // Verifica si la comida ya existe para el usuario y el tipo de comida
            let meal = await mealRepository.findOne({
                where: { uid: userId, type: mealType },
                relations: ["foods"], // Incluye la relación con los alimentos
            });
    
            if (!meal) {
                // Si la comida no existe, crea una nueva
                meal = mealRepository.create({
                    id: generateMealID(), // Genera un nuevo ID para la comida
                    type: mealType,
                    uid: userId,
                    foods: [],
                });
                await mealRepository.save(meal);
            }
    
            // Busca el alimento por código de barras
            const food = await foodRepository.findOneBy({ barcode });
            if (!food) {
                throw new UnknownErrorException(`Food item with barcode ${barcode} not found.`);
            }
    
            // Agrega el alimento a la comida (relación many-to-many)
            meal.foods.push(food);
            await mealRepository.save(meal); // Guarda la comida actualizada con el nuevo alimento
    
        } catch (error) {
            if (error instanceof Error) {
                throw new UnknownErrorException(`Error adding food to meal: ${error.message}`);
            } else {
                throw new UnknownErrorException('Unknown error adding food to meal.');
            }
        }
    }
}