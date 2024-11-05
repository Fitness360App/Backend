export interface DailyRecord {
    registerID: string;              // ID del registro
    uid: string;               // ID del usuario
    date: string;                      // Fecha del registro

    nutrients: {            // Información nutricional
        consumedCarbs: number;      // Carbohidratos (en gramos)
        consumedProteins: number;   // Proteínas (en gramos)
        consumedFats: number;       // Grasas (en gramos)
        consumedKcals: number;      // Calorías (en kcal)
    };

    steps: number;                    // Número de pasos
    burnedKcals: number;            // Calorías quemadas
}