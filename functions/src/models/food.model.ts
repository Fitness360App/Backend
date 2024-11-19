export interface Food {
    barcode: string;        // Código de barras del alimento
    name: string;           // Nombre del alimento
    brand: string;          // Marca del alimento
    servingSize: number;    // Tamaño de la porción (en gramos o mililitros)
    nutrients: {            // Información nutricional
        carbs: number;      // Carbohidratos (en gramos)
        proteins: number;   // Proteínas (en gramos)
        fats: number;       // Grasas (en gramos)
        kcals: number;      // Calorías (en kcal)
    };
    imagePath?: string; // Nueva propiedad opcional
}