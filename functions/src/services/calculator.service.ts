import { ValidationException } from "../utils/exceptions/passwordValidateException";

export class CalculatorService {


    calculateIMCByUserData(weight: number, height: number): number {
        height = height / 100;
        if (height <= 0 || weight <= 0) {
            throw new Error("Height and Weight must be greater than zero.");
        }
        console.log(weight, height);
        return Math.round(weight / (height * height));
    }

    calculateMacrosByUserData(goalWeight: number, weight: number, height: number, age: number, gender: string, activityLevel: string): { calories: number, protein: number, fat: number, carbs: number } {
        const sedentaryFactor = 1.2;
        const lightFactor = 1.375;
        const moderateFactor = 1.55;
        const activeFactor = 1.725;
        const veryActiveFactor = 1.9;

        // Ajuste de calorías basado en el objetivo
        const caloriesGoal = goalWeight > weight ? 500 : goalWeight < weight ? -500 : 0;

        // Convertir altura a centímetros

        // Calcular BMR según el género
        let BMR: number;
        if (gender === "male") {
            BMR = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            BMR = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        // Asignar el factor de actividad adecuado
        let activityFactor: number;
        switch (activityLevel) {
            case "sedentary":
                activityFactor = sedentaryFactor;
                break;
            case "light":
                activityFactor = lightFactor;
                break;
            case "moderate":
                activityFactor = moderateFactor;
                break;
            case "active":
                activityFactor = activeFactor;
                break;
            case "very_active":
                activityFactor = veryActiveFactor;
                break;
            default:
                activityFactor = sedentaryFactor;
                break;
        }

        const totalCalories = BMR * activityFactor + caloriesGoal;

        const protein = (totalCalories * 0.25) / 4; 
        const fat = (totalCalories * 0.25) / 9; 
        const carbs = (totalCalories - (protein * 4 + fat * 9)) / 4;

        return {
            calories: Math.round(totalCalories),
            protein: Math.round(protein),
            fat: Math.round(fat),
            carbs: Math.round(carbs)
        };
    }
}