import { ValidationException } from "../utils/exceptions/passwordValidateException";

export class CalculatorService {


    calculateIMCByUserData(weight: number, height: number): number {
        if (height <= 0) {
            throw new Error("Height must be greater than zero.");
        }
        return weight / (height * height);
    }

    calculateMacrosByUserData(weight: number, height: number, age: number, gender: 'male' | 'female', activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active'): { calories: number, protein: number, fat: number, carbs: number } {
        let bmr: number;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height * 100) - (5.677 * age);
        } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height * 100) - (4.330 * age);
    }

    let calories: number;
        switch (activityLevel) {
            case 'sedentary':
                calories = bmr * 1.2;
                break;
            case 'light':
                calories = bmr * 1.375;
                break;
            case 'moderate':
                calories = bmr * 1.55;
                break;
            case 'active':
                calories = bmr * 1.725;
                break;
            case 'very active':
                calories = bmr * 1.9;
                break;
            default:
                throw new ValidationException("Invalid activity level.");
        }

        const protein = weight * 2.2;
        const fat = (calories * 0.25) / 9;
        const carbs = (calories - (protein * 4 + fat * 9)) / 4;

        return {
            calories: Math.round(calories),
            protein: Math.round(protein),
            fat: Math.round(fat),
            carbs: Math.round(carbs)
        };
    }
}