import { AppDataSource } from './ormconfig';
import { Food2 } from "../src/entity/food";

async function seedDatabaseFood() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("Base de datos inicializada.");
        }
        
        const foodRepository = AppDataSource.getRepository(Food2);

        // Crear los productos
        const foods: Food2[] = [
            {
                barcode: "7622300362652",
                name: "Galletas Mini Principe",
                brand: "LU",
                servingSize: 100,
                carbs: 63,
                proteins: 6.3,
                fats: 25,
                kcals: 510,
                mealFoods: [],
                imagePath: "anacardos.jpg",
            },
            {
                barcode: "8436030521628",
                name: "Anacardos Fritos Salados",
                brand: "HiperDino",
                servingSize: 100,
                carbs: 27,
                proteins: 17,
                fats: 48,
                kcals: 61,
                mealFoods: [],
                imagePath: "principe.jpg",
            },
            // Agrega aquí los otros 8 productos
            {
                barcode: "8421991031422",
                name: "Manices Fritos",
                brand: "Casa Ricardo",
                servingSize: 100,
                carbs: 18,
                proteins: 24,
                fats: 54,
                kcals: 636,
                mealFoods: [],
                imagePath: "manices.jpg",
            },
            {
                barcode: "8480000323163",
                name: "Caramelo Líquido",
                brand: "Hacendado",
                servingSize: 100,
                carbs: 84,
                proteins: 0.5,
                fats: 0.1,
                kcals: 339,
                mealFoods: [],
                imagePath: "caramelo.jpg",
            },
            {
                barcode: "8402001018756",
                name: "Pimenton Dulce Molido",
                brand: "Hacendado",
                servingSize: 100,
                carbs: 34.84,
                proteins: 8,
                fats: 12.95,
                kcals: 357,
                mealFoods: [],
                imagePath: "pimenton.jpg",
            },
            {
                barcode: "8410085000253",
                name: "Choco Sandwich",
                brand: "Tirma",
                servingSize: 100,
                carbs: 59,
                proteins: 7.4,
                fats: 26,
                kcals: 502,
                mealFoods: [],
                imagePath: "choco.jpg",
            },
            {
                barcode: "0723120863033",
                name: " Mermelada de Tuno Verde",
                brand: "Cactus Jam",
                servingSize: 100,
                carbs: 60,
                proteins: 0.4,
                fats: 0.2,
                kcals: 240,
                mealFoods: [],
                imagePath: "mermelada.jpg",
            },
            {
                barcode: "8410599024363",
                name: "Atun en Aceite de Oliva",
                brand: "Pescamar",
                servingSize: 100,
                carbs: 0.5,
                proteins: 15,
                fats: 38,
                kcals: 405,
                mealFoods: [],
                imagePath: "atun.jpg",
            },
            {
                barcode: "7622202035531",
                name: "Barquillos Rellenos de Chocolate con Leche",
                brand: "Fontaneda",
                servingSize: 100,
                carbs: 65,
                proteins: 6.9,
                fats: 23,
                kcals: 496,
                mealFoods: [],
                imagePath: "barquillos.jpg",
            },
        ];

        // Guardar los productos en la base de datos
        await foodRepository.save(foods);
        console.log("Productos iniciales añadidos a la base de datos.");
    } catch (error) {
        console.error("Error al inicializar los productos:", error);
    }
}

seedDatabaseFood();
