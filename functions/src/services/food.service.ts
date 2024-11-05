import { firestore } from 'firebase-admin';
import { Food } from '../models/food.model';
import { FoodServiceException } from '../utils/exceptions/foodServiceException';

import { AppDataSource } from "../ormconfig";
import { Food2 } from "../entity/food";



export class FoodService {
    //private foodCollection = firestore().collection('food');

    // Método para buscar un alimento por su código de barras (ya implementado)
    /*async searchFoodByBarcode(barcode: string): Promise<Food | null> {
        try {
            //const foodSnapshot = await this.foodCollection.where('barcode', '==', barcode).get();
            
            if (foodSnapshot.empty) {
                return null;
                //throw new FoodServiceException('No se encontró un alimento con ese código de barras');
            }

            const foodData = {} as Food;
            return foodData;
        } catch (error) {
            throw new FoodServiceException('Error al buscar el alimento por código de barras');
        }
    }*/

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

    // Método para buscar alimentos por nombre
    /*async searchFoodByName(name: string): Promise<Food[]> {
        try {

            const lowerCaseName = name.toLowerCase();
            console.log(lowerCaseName)
            /*const foodSnapshot = await this.foodCollection
                .orderBy('name') // Ordenar por el nombre
                .startAt(lowerCaseName)    // Comenzar desde el nombre proporcionado
                .endAt(lowerCaseName + '\uf8ff') // Limitar a los nombres que comiencen con el texto
                .get();
    
            if (foodSnapshot.empty) {
                throw new FoodServiceException('No se encontró ningún alimento con ese nombre');
            }

            
    
            const foods: Food[] = [];
            return foods;
        } catch (error) {
            throw new FoodServiceException('Error al buscar el alimento por nombre');
        }
    }*/

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

    // Nuevo método para crear un alimento en Firestore
    /*async createFood(food: Food): Promise<void> {
        try {
            console.log(food);
            // Verificar si el alimento ya existe por código de barras
            const foodSnapshot = await this.searchFoodByBarcode(food.barcode);
            
            if (foodSnapshot) {
                throw new FoodServiceException('El alimento ya existe con ese código de barras');
            }
            console.log("Entro");
            // Crear un nuevo objeto de alimento con el nombre en minúsculas para búsquedas insensibles a mayúsculas
            const foodWithLowercaseName = {
                ...food,
                name: food.name.toLowerCase() // Almacenar el nombre en minúsculas
            };
    
            // Guardar el alimento en Firestore
            //await this.foodCollection.add(foodWithLowercaseName);
        } catch (error) {
            throw new FoodServiceException('Error al crear el alimento');
        }
    }*/

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
