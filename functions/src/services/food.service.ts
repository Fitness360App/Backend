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

    // Nuevo método para crear un alimento en Firestore
    async createFood(food: Food): Promise<void> {
        try {
            const foodSnapshot = await this.searchFoodByBarcode(food.barcode);
            
            if (foodSnapshot) {
                throw new ValidationException('El alimento ya existe con ese código de barras');
            }

            // Guardar el alimento en Firestore
            await this.foodCollection.add(food);
        } catch (error) {
            throw new ValidationException('Error al crear el alimento');
        }
    }
}
