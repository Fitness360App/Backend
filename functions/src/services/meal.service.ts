import { firestore } from 'firebase-admin';
import { Meal } from '../models/meal.model';
import { generateMealID } from '../utils/idGenerator';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';
import { FoodService } from './food.service';
import { MealFood } from "../entity/mealfood";

//import { MealException } from '../utils/exceptions/mealException';

import { AppDataSource } from "../ormconfig";
import { Meal2 } from "../entity/meal";
import { Food2 } from "../entity/food";

export class MealService {
    //private mealCollection = firestore().collection('meals');
    private foodService = new FoodService();


    async getMealWithFoods(uid: string, mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' ): Promise<{ food: Food2, servingSize: number }[] | null> {
        try {
            // Verifica si el Meal existe primero
            const exists = await this.mealExists(uid, mealType);
    
            if (!exists) {
                // Si no existe, retorna null
                return null; 
            }
    
            // Si existe, obtenemos el meal con los alimentos asociados a través de MealFood
            const mealRepository = AppDataSource.getRepository(Meal2);
            const meal = await mealRepository.findOne({
                where: { uid, type: mealType },
                relations: ['mealFoods', 'mealFoods.food'], // Incluye MealFood y Food2 relacionados
            });

    
            if (meal) {
                // Mapea cada MealFood a un objeto con el alimento y su tamaño de porción específico
                return meal.mealFoods.map(mealFood => ({
                    food: mealFood.food,
                    servingSize: mealFood.servingSize
                }));
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
    
        // Obtén el repositorio de Meal
        const mealRepository = AppDataSource.getRepository(Meal2);
    
        // Busca una comida específica para el usuario y tipo dados
        const meal = await mealRepository.findOneBy({ uid, type: type as Meal["type"] });
    
        // Retorna verdadero si se encuentra la comida, falso en caso contrario
        return !!meal;
    }


    async addFoodToMeal(
        barcode: string,
        userId: string,
        mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extras',
        servingSize: number
    ): Promise<void> {
        try {
            const mealRepository = AppDataSource.getRepository(Meal2);
            const foodRepository = AppDataSource.getRepository(Food2);
            const mealFoodRepository = AppDataSource.getRepository(MealFood);
    
            // Verifica si la comida ya existe para el usuario y el tipo de comida
            let meal = await mealRepository.findOne({
                where: { uid: userId, type: mealType },
                relations: ["mealFoods"],
            });
    
            if (!meal) {
                // Si la comida no existe, crea una nueva
                meal = mealRepository.create({
                    id: generateMealID(),
                    type: mealType,
                    uid: userId,
                    mealFoods: []
                });
                await mealRepository.save(meal);
            }
    
            // Busca el alimento por código de barras
            const food = await foodRepository.findOneBy({ barcode });
            if (!food) {
                throw new UnknownErrorException(`Food item with barcode ${barcode} not found.`);
            }
    
            // Verifica si ya existe el alimento en el `MealFood` para evitar duplicados
            const existingMealFood = await mealFoodRepository.findOne({
                where: {
                    meal: meal,
                    food: food
                }
            });
    
            if (existingMealFood) {
                throw new UnknownErrorException(`Food item with barcode ${barcode} already exists in the meal.`);
            }
    
            // Si no existe, crea una nueva instancia de MealFood
            const mealFood = mealFoodRepository.create({
                meal: meal,
                food: food,
                servingSize: servingSize
            });

            console.log("===================================\n")
            console.log(mealFood);
    
            // Guarda la instancia de MealFood en la base de datos
            await mealFoodRepository.save(mealFood);
    
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
            const mealFoodRepository = AppDataSource.getRepository(MealFood);
    
            // Verificar si existe un meal del tipo especificado para el usuario
            const meal = await mealRepository.findOne({
                where: { uid: userId, type: mealType }
            });

            console.log(meal);
    
            if (!meal) {
                throw new UnknownErrorException(`No existe un meal de tipo ${mealType} para el usuario ${userId}.`);
            }
    
            // Verificar si el alimento está asociado con el meal específico
            const mealFoodRelation = await mealFoodRepository.findOne({
                where: { meal: { id: meal.id }, food: { barcode: barcode } },
                relations: ['meal', 'food']
            });
    
            if (!mealFoodRelation) {
                throw new UnknownErrorException(`El alimento con código de barras ${barcode} no está asociado con el meal de tipo ${mealType}.`);
            }
    
            // Eliminar la relación específica en MealFood
            await mealFoodRepository.remove(mealFoodRelation);
    
            console.log(`Alimento con código de barras ${barcode} eliminado exitosamente del meal de tipo ${mealType}.`);
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
            const mealFoodRepository = AppDataSource.getRepository(MealFood);
    
            // Verificar si existe un meal del tipo especificado para el usuario
            const meal = await mealRepository.findOne({
                where: { uid: userId, type: mealType },
                relations: ['mealFoods', 'mealFoods.food'], // Incluir la relación con mealFoods y food
            });
    
            if (!meal) {
                throw new UnknownErrorException(`No existe un meal de tipo ${mealType} para el usuario ${userId}.`);
            }
    
            // Buscar el registro MealFood con el código de barras proporcionado
            const mealFood = meal.mealFoods.find(mealFood => mealFood.food.barcode === barcode);
    
            if (!mealFood) {
                throw new UnknownErrorException(`No se encontró el alimento con código de barras ${barcode} en el meal.`);
            }
    
            // Actualizar el tamaño de la porción en MealFood
            mealFood.servingSize = newSize;

    
            // Guardar los cambios en la base de datos
            await mealFoodRepository.save(mealFood);
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
            const mealFoodRepository = AppDataSource.getRepository(MealFood);
    
            // Busca todas las comidas del usuario
            const meals = await mealRepository.find({ where: { uid: uid } });
            // Obtén todos los MealFood asociados a cada comida y elimínalos
            for (const meal of meals) {
                const mealFoods = await mealFoodRepository.find({ where: { meal: { id: meal.id } } });
                for (const mealFood of mealFoods) {
                    await mealFoodRepository.remove(mealFood);
                }
            }
    
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