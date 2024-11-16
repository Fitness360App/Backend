// src/controllers/meal.controller.ts
import { MealService } from '../services/meal.service';
import { InternalException } from '../utils/exceptions/InternalException';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';

export class MealController {
    private mealService: MealService;

    constructor() {
        this.mealService = new MealService();
    }


    getMealWithFoods = async (req: any, res: any) => {
        const { uid, type } = req.params;   

        // Validación de parámetros
        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }

        if (!type) {
            return res.status(400).json({ message: 'El tipo de comida es requerido' });
        }

        try {
            const meal = await this.mealService.getMealWithFoods(uid, type);

            if (!meal) {
                return res.status(404).json({ message: `No se encontró una comida de tipo ${type} para el usuario ${uid}` });
            }

            return res.status(200).json(meal); // Devuelve la comida con los alimentos
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener la comida con alimentos' });
        }
    };

    // Controller method to add a food item to a meal
    addFoodToMeal = async (req: any, res: any) => {
        console.log("ENTRO A ADD FOOD TO MEAL")
        const { barcode, uid, type, servingSize } = req.body;
        console.log("===================================\n")
        console.log(barcode, uid, type, servingSize);
        try {
            await this.mealService.addFoodToMeal(barcode, uid, type, servingSize);
            return res.status(200).json({ message: 'Food item added to meal successfully' });
        } catch (error) {
            return res.status(500).json({ error: 'Error adding food to meal' });
        }
    };
    
    // Método para verificar si existe un Meal del mismo tipo para el usuario
    checkMealExists = async (req: any, res: any) => {
        const { uid, type } = req.body;

        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }

        if (!type) {
            return res.status(400).json({ message: 'El tipo de comida es requerido' });
        }

        try {
            const exists = await this.mealService.mealExists(uid as string, type as string);
            return res.status(200).json({ exists }); // Devuelve `true` o `false`
        } catch (error) {
            if (error instanceof InternalException) {
                return res.status(500).json({ error: error.message });
            } else {
                return res.status(500).json({ error: 'Error desconocido al verificar el meal' });
            }
        }
    };

    removeFoodFromMeal = async (req: any, res: any) => {
        const { barcode, uid, type } = req.query;
        const requiredFields = [
            { field: 'uid', message: 'UID del usuario es requerido' },
            { field: 'barcode', message: 'El código de barras del alimento es requerido' },
            { field: 'type', message: 'El tipo de comida es requerido' }
        ];

        for (const { field, message } of requiredFields) {
            if (!req.query[field]) {
            return res.status(400).json({ message });
            }
        }

        try {    
            await this.mealService.removeFoodFromMeal(barcode, uid, type);
            return res.status(200).json({ message: 'Alimento eliminado del meal exitosamente' });
        } catch (error) {
            return res.status(500).json({ error: 'Error al eliminar el alimento del meal' });
        }
    };


    editFoodInMeal = async (req: any, res: any) => {
        const { barcode, uid, type, newSize } = req.body;
        const requiredFields = [
            { field: 'uid', message: 'UID del usuario es requerido' },
            { field: 'barcode', message: 'El código de barras del alimento es requerido' },
            { field: 'type', message: 'El tipo de comida es requerido' },
            { field: 'newSize', message: 'El nuevo tamaño de la porción es requerido' }
        ];

        for (const { field, message } of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message });
            }
        }

        try {
            await this.mealService.editFoodFromMeal(barcode, uid, type, newSize);
            return res.status(200).json({ message: 'Tamaño de la porción actualizado exitosamente' });
        } catch (error) {
            if (error instanceof UnknownErrorException) {
                return res.status(404).json({ error: error.message });
            } else {
                return res.status(500).json({ error: 'Error updating food in meal' });
            }
        }
    };


}