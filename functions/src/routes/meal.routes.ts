// src/routes/meal.routes.ts
import { Router } from 'express';
import { MealController } from '../controllers/meal.controller';

const router = Router();
const mealController = new MealController();


router.get('/check-exists', mealController.checkMealExists);

// Route to add a food item to a meal
router.post('/add-food', mealController.addFoodToMeal);

// Nueva ruta para eliminar un alimento de un meal
router.delete('/remove', mealController.removeFoodFromMeal)

router.put('/edit', mealController.editFoodInMeal);

router.get('/get-meal/:uid/:type', mealController.getMealWithFoods);

export default router;