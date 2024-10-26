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
        const { barcode, uid, type, servingSize } = req.body;
        const requiredFields = [
            { field: 'uid', message: 'User UID is required' },
            { field: 'barcode', message: 'Food barcode is required' },
            { field: 'type', message: 'Meal type is required' },
            { field: 'servingSize', message: 'Serving size is required' }
        ];

        for (const { field, message } of requiredFields) {
            if (!req.body[field]) {
                
                return res.status(400).json({ message });
            }
        }

        try {
            // Verificar si el usuario existe
            
            const userExists = await this.userController.userExists(uid);

            if (!userExists) {
                return res.status(404).json({ message: 'El usuario no existe' });
            }
            
            await this.mealService.addFoodToMeal(barcode, uid, type, servingSize);
            res.status(200).json({ message: 'Food item added to meal and serving size updated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Error adding food to meal' });
        }
    };



    removeFoodFromMeal = async (req: any, res: any) => {
        const { barcode, uid, type } = req.body;
        const requiredFields = [
            { field: 'uid', message: 'UID del usuario es requerido' },
            { field: 'barcode', message: 'El código de barras del alimento es requerido' },
            { field: 'type', message: 'El tipo de comida es requerido' }
        ];

        for (const { field, message } of requiredFields) {
            if (!req.body[field]) {
            return res.status(400).json({ message });
            }
        }

        try {
            // Verificar si el usuario existe
            const userExists = await this.userController.userExists(uid);
            
            if (!userExists) {
                return res.status(404).json({ message: 'El usuario no existe' });
            }
    
            // Llamar al servicio para eliminar el alimento
            await this.mealService.removeFoodFromMeal(barcode, uid, type);
            res.status(200).json({ message: 'Alimento eliminado del meal exitosamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el alimento del meal' });
        }
    };
    
    // Método para verificar si existe un Meal del mismo tipo para el usuario
    checkMealExists = async (req: any, res: any) => {
        const { uid, type } = req.body;
        const requiredFields = [
            { field: 'uid', message: 'UID del usuario es requerido' },
            { field: 'type', message: 'El tipo de comida es requerido' }
        ];

        for (const { field, message } of requiredFields) {
            if (!req.body[field]) {
            return res.status(400).json({ message });
            }
        }

        try {
            const userExists = await this.userController.userExists(uid);
            
            if (!userExists) {
                return res.status(404).json({ message: 'El usuario no existe' });
            }
    
            const exists = await this.mealService.mealExists(uid as string, type as string);
            res.status(200).json({ exists }); 
        } catch (error) {
            if (error instanceof InternalException) {
                res.status(500).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Error desconocido al verificar el meal' });
            }
        }
    };


    // Controller method to edit food item in a meal
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
            // Verificar si el usuario existe
            const userExists = await this.userController.userExists(uid);

            if (!userExists) {
                return res.status(404).json({ message: 'El usuario no existe' });
            }

            await this.mealService.editFoodFromMeal(barcode, uid, type, newSize);
            res.status(200).json({ message: 'Tamaño de la porción actualizado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error updating food in meal' });
        }
    };


}
