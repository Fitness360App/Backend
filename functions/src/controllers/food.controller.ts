import { Request, Response } from 'express';
import { FoodService } from '../services/food.service';
import { validateBarcode, validateNutrients, validateServingSize } from '../utils/validation';
import { Food } from '../models/food.model';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';
import { ValidationException } from '../utils/exceptions/passwordValidateException';
import { FoodServiceException } from '../utils/exceptions/foodServiceException';
import { InternalException } from '../utils/exceptions/InternalException';

export class FoodController {
    private foodService: FoodService;

    constructor() {
        this.foodService = new FoodService();
    }

    // Método para buscar un alimento por su código de barras (ya implementado)
    searchFoodByBarcode = async (req: Request, res: Response) => {
        const { barcode } = req.params;

        if (!barcode) {
            throw new ValidationException('Barcode is required');
        }

        try {
            const food = await this.foodService.searchFoodByBarcode(barcode);

            if (!food) {
                throw new FoodServiceException('Food not found');
            }

            res.status(200).json(food);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new InternalException(error.message);
            } else {
                throw new UnknownErrorException('Unknown error occurred');
            }
        }
    };

    // Método para buscar alimentos por nombre
    searchFoodByName = async (req: Request, res: Response) => {
        const { name } = req.params; // Obtener el nombre de la URL

        if (!name) {
            throw new ValidationException('Product name is required');
        }

        try {
            const foods = await this.foodService.searchFoodByName(name);

            if (foods.length === 0) {
                throw new FoodServiceException('No foods found with that name');
            }

            res.status(200).json(foods); // Devolver la lista de alimentos encontrados
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new InternalException(error.message);
            } else {
                throw new UnknownErrorException('Unknown error occurred');
            }
        }
    };

    // Nuevo método para crear un alimento
    createFood = async (req: Request, res: Response) => {
        const { barcode, name, brand, servingSize, nutrients } = req.body;

        // Validación de los campos requeridos
        if (!barcode || !name || !brand || !servingSize || !nutrients) {
            throw new ValidationException('All fields are required');
        }

        // Validar que el código de barras tenga un formato válido
        if (!validateBarcode(barcode)) {
            throw new ValidationException('Invalid barcode format');
        }

        if (!validateServingSize(servingSize)) {
            throw new ValidationException('Invalid serving size');
        }
        
        if (!validateNutrients(nutrients)) {
            throw new ValidationException('Invalid nutrient values');
        }

        // Crear objeto Food
        const food: Food = {
            barcode,
            name,
            brand,
            servingSize: parseFloat(servingSize), // Convertir a número
            nutrients: {
                carbs: parseFloat(nutrients.carbs),
                proteins: parseFloat(nutrients.proteins),
                fats: parseFloat(nutrients.fats),
                kcals: parseFloat(nutrients.kcals)
            }
        };

        console.log(food)

        try {
            // Intentar crear el alimento en Firestore
            await this.foodService.createFood(food);
            res.status(201).json({ message: 'Food created successfully' });
        } catch (error: unknown) {
            console.error('Error in createFood:', error);
            if (error instanceof Error) {
                throw new InternalException(error.message);
            } else {
                throw new UnknownErrorException('Unknown error occurred');  
            }
        }
    };
}