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



    async getMealWithFoods(uid: string, mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' ) {
        try {
            // Verifica si el Meal existe primero
            const exists = await this.mealExists(uid, mealType);

            if (!exists) {
                // Si no existe, retorna null o lanza un error
                return null; // O lanzar un error como: throw new Error(`Meal of type ${mealType} not found for user ${uid}`);
            }

            // Si existe, obtenemos el meal con los alimentos asociados
            const mealRepository = AppDataSource.getRepository(Meal2);
            const meal = await mealRepository.findOne({
                where: { uid, type: mealType },
                relations: ['foods'], // Incluye los alimentos asociados
            });

            if (meal) {
                return meal.foods; // Devuelve la comida con los alimentos
            } else {
                throw new UnknownErrorException(`Meal of type ${mealType} not found for user ${uid}`);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new UnknownErrorException(`Error obteniendo la comida con alimentos: ${error.message}`);
            } else {
                throw new UnknownErrorException('Unknown error obteniendo la comida con alimentos.');
            }
        }
    }

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


    async removeFoodFromMeal(
        barcode: string,
        userId: string,
        mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extras'
    ): Promise<void> {
        try {
            const mealRepository = AppDataSource.getRepository(Meal2);

            // Verificar si existe un meal del tipo especificado para el usuario
            const meal = await mealRepository.findOne({
                where: { uid: userId, type: mealType },
                relations: ['foods'],
            });

            if (!meal) {
                throw new UnknownErrorException(`No existe un meal de tipo ${mealType} para el usuario ${userId}.`);
            }

            // Filtrar el alimento a eliminar
            meal.foods = meal.foods.filter(food => food.barcode !== barcode);

            // Guardar los cambios en la base de datos
            await mealRepository.save(meal);
        } catch (error) {
            if (error instanceof Error) {
                throw new UnknownErrorException(`Error removing food from meal: ${error.message}`);
            } else {
                throw new UnknownErrorException('Unknown error removing food from meal.');
            }
        }
    }


    async editFoodFromMeal(
        barcode: string,
        userId: string,
        mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extras',
        newSize: number
    ): Promise<void> {
        try {
            const mealRepository = AppDataSource.getRepository(Meal2);
    
            // Verificar si existe un meal del tipo especificado para el usuario
            const meal = await mealRepository.findOne({
                where: { uid: userId, type: mealType },
                relations: ['foods'],
            });
    
            if (!meal) {
                throw new UnknownErrorException(`No existe un meal de tipo ${mealType} para el usuario ${userId}.`);
            }
    
            // Buscar el alimento con el código de barras proporcionado
            const food = meal.foods.find(food => food.barcode === barcode);
    
            if (!food) {
                throw new UnknownErrorException(`No se encontró el alimento con código de barras ${barcode} en el meal.`);
            }
    
            // Actualizar el tamaño de la porción
            food.servingSize = newSize;
            //console.log(food);
    
            // Guardar los cambios en la base de datos
            await AppDataSource.getRepository(Food2).save(food);
        } catch (error) {
            if (error instanceof Error) {
                throw new UnknownErrorException(`Error editing food in meal: ${error.message}`);
            } else {
                throw new UnknownErrorException('Unknown error editing food in meal.');
            }
        }
    }

    // Método para eliminar todas los daily record de un usuario
    async deleteAllMeals(uid: string): Promise<void> {
        try {
            // Obtén el repositorio de Meal
            const mealRepository = AppDataSource.getRepository(Meal2);
    
            // Busca todas las comidas del usuario
            const meals = await mealRepository.find({ where: { uid } });
    
            // Elimina cada comida
            for (const meal of meals) {
                await mealRepository.remove(meal);
            }
        } catch (error) {
            if (error instanceof Error) {
                throw new UnknownErrorException(`Error deleting all meals: ${error.message}`);
            } else {
                throw new UnknownErrorException('Unknown error deleting all meals.');
            }
        }
    }
    
}