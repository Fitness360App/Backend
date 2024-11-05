import { firestore } from 'firebase-admin';
import { Food } from '../models/food.model';
import { FoodServiceException } from '../utils/exceptions/foodServiceException';

import { AppDataSource } from "../ormconfig";
import { Food2 } from "../entity/food";



export class FoodService {

    async searchFoodByBarcode(barcode: string): Promise<Food | null> {
        try {
            // Obtén el repositorio de Food
            const foodRepository = AppDataSource.getRepository(Food2);
    
            // Busca el alimento por código de barras
            const food = await foodRepository.findOneBy({ barcode });
    
            // Si no se encuentra el alimento, retorna null
            if (!food) {
                return null;
            }
    
            // Estructura los datos de retorno para incluir `nutrients` como un objeto
            return {
                ...food,
                nutrients: {
                    carbs: food.carbs,
                    proteins: food.proteins,
                    fats: food.fats,
                    kcals: food.kcals,
                }
            };
        } catch (error) {
            throw new FoodServiceException('Error al buscar el alimento por código de barras');
        }
    }



    async searchFoodByName(name: string): Promise<Food[]> {
        try {
            const lowerCaseName = name.toLowerCase();
    
            // Obtén el repositorio de Food
            const foodRepository = AppDataSource.getRepository(Food2);
    
            // Consulta para obtener los alimentos cuyo nombre comienza con el texto proporcionado
            const foods = await foodRepository
                .createQueryBuilder("food")
                .where("LOWER(food.name) LIKE :name", { name: `${lowerCaseName}%` })
                .orderBy("food.name", "ASC") // Ordenar alfabéticamente por nombre
                .getMany();
    
            // Si no se encuentran alimentos, lanza una excepción
            if (foods.length === 0) {
                throw new FoodServiceException('No se encontró ningún alimento con ese nombre');
            }
    
            // Retorna la lista de alimentos
            return foods.map(food => ({
                ...food,
                nutrients: {
                    carbs: food.carbs,
                    proteins: food.proteins,
                    fats: food.fats,
                    kcals: food.kcals,
                }
            }));
        } catch (error) {
            throw new FoodServiceException('Error al buscar el alimento por nombre');
        }
    }



    async createFood(food: Food): Promise<void> {
        try {
            console.log(food);
    
            // Obtén el repositorio de Food
            const foodRepository = AppDataSource.getRepository(Food2);
    
            // Verificar si el alimento ya existe por código de barras
            const existingFood = await this.searchFoodByBarcode(food.barcode);
    
            if (existingFood) {
                throw new FoodServiceException('El alimento ya existe con ese código de barras');
            }
    
            console.log("Entro");
    
            // Crear un nuevo objeto de alimento con el nombre en minúsculas para búsquedas insensibles a mayúsculas
            const foodWithLowercaseName = foodRepository.create({
                ...food,
                name: food.name.toLowerCase(), // Almacenar el nombre en minúsculas
                carbs: food.nutrients.carbs,
                proteins: food.nutrients.proteins,
                fats: food.nutrients.fats,
                kcals: food.nutrients.kcals,
            });
    
            // Guardar el alimento en la base de datos
            await foodRepository.save(foodWithLowercaseName);
        } catch (error) {
            throw new FoodServiceException('Error al crear el alimento');
        }
    }
}