// src/controllers/meal.controller.ts
import { MealService } from '../services/meal.service';
import { InternalException } from '../utils/exceptions/InternalException';
import { ValidationException } from '../utils/exceptions/passwordValidateException';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';

export class MealController {
    private mealService: MealService;

    constructor() {
        this.mealService = new MealService();
    }

    // Controller method to add a food item to a meal
    addFoodToMeal = async (req: any, res: any) => {
        const { barcode, uid, type } = req.body;
        console.log(req.body);
        console.log(uid, type);
        try {
            await this.mealService.addFoodToMeal(barcode, uid, type);
            res.status(200).json({ message: 'Food item added to meal successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error adding food to meal' });
        }
    };
    
    // Método para verificar si existe un Meal del mismo tipo para el usuario
    checkMealExists = async (req: any, res: any) => {
        const { uid, type } = req.body;

        if (!uid) {
            throw new ValidationException('UID del usuario es requerido');
        }

        if (!type) {
            throw new ValidationException('El tipo de comida es requerido');
        }

        try {
            const exists = await this.mealService.mealExists(uid as string, type as string);
            res.status(200).json({ exists }); // Devuelve `true` o `false`
        } catch (error) {
            if (error instanceof InternalException) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Error desconocido al verificar el meal' });
            }
        }
    };


}
