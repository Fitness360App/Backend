import { Food } from './food.model';

export interface Meal {
    id: string;             // Unique identifier for the meal
    type: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extras'; // Type of meal
    foods: Food[];          // Array of foods in the meal
    uid: string;            // User identifier
}
