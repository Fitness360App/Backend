export const convertStepsToKcal = (steps: number, caloriesPerStep: number = 0.05): number => {
    if (steps < 0) {
        throw new Error("El número de pasos no puede ser negativo");
    }
    return steps * caloriesPerStep; // Devuelve las calorías quemadas
};