import { Request, Response } from 'express';
import { FoodService } from '../services/food.service';
import { validateBarcode, validateNutrients, validateServingSize } from '../utils/validation';
import { Food } from '../models/food.model';
import { ValidationException } from '../utils/exceptions/passwordValidateException';
import { FoodServiceException } from '../utils/exceptions/foodServiceException';

export class FoodController {
    private foodService: FoodService;

    constructor() {
        this.foodService = new FoodService();
    }

    // Método para buscar un alimento por su código de barras (ya implementado)
    searchFoodByBarcode = async (req: Request, res: Response) => {
        const { barcode } = req.params;

        if (!barcode) {
            res.status(400).json({ message: 'Barcode is required' });
        }

        try {
            const food = await this.foodService.searchFoodByBarcode(barcode);

            if (!food) {
                return res.status(404).json({ message: 'Food not found' });
            }

            res.status(200).json(food);
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
        
    };

    // Método para buscar alimentos por nombre
    searchFoodByName = async (req: Request, res: Response) => {
        const { name } = req.params; // Obtener el nombre de la URL

        if (!name) {
            res.status(400).json({ message: 'Product name is required' });
        }

        try {
            const foods = await this.foodService.searchFoodByName(name);

            if (foods.length === 0) {
                return res.status(400).json({ message: 'No foods found with that name' });
            }

            res.status(200).json(foods); // Devolver la lista de alimentos encontrados
        } catch (error: unknown) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
    };

    // Nuevo método para crear un alimento
    createFood = async (req: Request, res: Response) => {
        const { barcode, name, brand, servingSize, nutrients } = req.body;

        // Validación de los campos requeridos
        if (!barcode || !name || !brand || !servingSize || !nutrients) {
            res.status(400).json({ message: 'All fields are required' });
        }

        // Validar que el código de barras tenga un formato válido
        if (!validateBarcode(barcode)) {
            return res.status(400).json({ message: 'Invalid barcode format' });
        }

        if (!validateServingSize(servingSize)) {
            return res.status(400).json({ message: 'Invalid serving size' });
        }
        
        if (!validateNutrients(nutrients)) {
            return res.status(400).json({ message: 'Invalid nutrient values' });
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


        try {
            // Intentar crear el alimento en Firestore
            await this.foodService.createFood(food);
            res.status(201).json({ message: 'Food created successfully' });
        } catch (error: unknown) {
            if (error instanceof FoodServiceException) {
                res.status(500).json({ message: error.message });
            } else {
                res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
    };
}