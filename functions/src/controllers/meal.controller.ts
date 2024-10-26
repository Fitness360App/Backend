// src/controllers/meal.controller.ts
import { MealService } from '../services/meal.service';
import { InternalException } from '../utils/exceptions/InternalException';
import { ValidationException } from '../utils/exceptions/passwordValidateException';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';
import { UserController } from './user.controller';

export class MealController {
    private mealService: MealService;
    private userController: UserController;

    constructor() {
        this.mealService = new MealService();
        this.userController = new UserController();
    }

    // Controller method to add a food item to a meal
    addFoodToMeal = async (req: any, res: any) => {
        const { barcode, uid, type } = req.body;
    
        if (!uid) {
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }
    
        if (!barcode) {
            return res.status(400).json({ message: 'El código de barras del alimento es requerido' });
        }
    
        if (!type) {
            return res.status(400).json({ message: 'El tipo de comida es requerido' });
        }
    
        try {
            // Verificar si el usuario existe
            const userExists = await this.userController.userExists(uid);
            
            if (!userExists) {
                return res.status(404).json({ message: 'El usuario no existe' });
            }
    
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
            return res.status(400).json({ message: 'UID del usuario es requerido' });
        }
    
        if (!type) {
            return res.status(400).json({ message: 'El tipo de comida es requerido' });
        }
    
        try {
            // Verificar si el usuario existe
            const userExists = await this.userController.userExists(uid);
            
            if (!userExists) {
                return res.status(404).json({ message: 'El usuario no existe' });
            }
    
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
