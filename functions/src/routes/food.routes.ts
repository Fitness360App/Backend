import { Router } from 'express';
import { FoodController } from '../controllers/food.controller';

const router = Router();const foodController = new FoodController();

// Ruta para buscar un alimento por código de barras (ya implementado)
router.get('/search/:barcode', foodController.searchFoodByBarcode);

// Ruta para buscar un alimento por nombre
router.get('/search/name/:name', foodController.searchFoodByName);

// Nueva ruta para crear un alimento
router.post('/create', foodController.createFood);

router.get('/featured', foodController.getFeaturedFoods);

export default router;
