import { firestore } from 'firebase-admin';
import { Food } from '../models/food.model';
import { ValidationException } from '../utils/exceptions/passwordValidateException';

export class FoodService {
    private foodCollection = firestore().collection('food');

    // Método para buscar un alimento por su código de barras (ya implementado)
    async searchFoodByBarcode(barcode: string): Promise<Food | null> {
        try {
            const foodSnapshot = await this.foodCollection.where('barcode', '==', barcode).get();
            
            if (foodSnapshot.empty) {
                return null;
            }

            const foodData = foodSnapshot.docs[0].data() as Food;
            return foodData;
        } catch (error) {
            throw new ValidationException('Error al buscar el alimento por código de barras');
        }
    }

    // Método para buscar alimentos por nombre
    async searchFoodByName(name: string): Promise<Food[]> {
        try {

            const lowerCaseName = name.toLowerCase();
            console.log(lowerCaseName)
            const foodSnapshot = await this.foodCollection
                .orderBy('name') // Ordenar por el nombre
                .startAt(lowerCaseName)    // Comenzar desde el nombre proporcionado
                .endAt(lowerCaseName + '\uf8ff') // Limitar a los nombres que comiencen con el texto
                .get();
    
            if (foodSnapshot.empty) {
                return []; // Si no se encontró ningún alimento con ese nombre o prefijo
            }

            
    
            const foods: Food[] = foodSnapshot.docs.map(doc => doc.data() as Food);
            return foods;
        } catch (error) {
            throw new ValidationException('Error al buscar el alimento por nombre');
        }
    }

    // Nuevo método para crear un alimento en Firestore
    async createFood(food: Food): Promise<void> {
        try {
            // Verificar si el alimento ya existe por código de barras
            const foodSnapshot = await this.searchFoodByBarcode(food.barcode);
            
            if (foodSnapshot) {
                throw new ValidationException('El alimento ya existe con ese código de barras');
            }
    
            // Crear un nuevo objeto de alimento con el nombre en minúsculas para búsquedas insensibles a mayúsculas
            const foodWithLowercaseName = {
                ...food,
                name: food.name.toLowerCase() // Almacenar el nombre en minúsculas
            };
    
            // Guardar el alimento en Firestore
            await this.foodCollection.add(foodWithLowercaseName);
        } catch (error) {
            throw new ValidationException('Error al crear el alimento');
        }
    }
}
