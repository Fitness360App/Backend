import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Meal2 } from './meal';
import { Food2 } from './food';

@Entity()
export class MealFood {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Meal2, meal => meal.mealFoods)
    meal!: Meal2;

    @ManyToOne(() => Food2, food => food.mealFoods)
    food!: Food2;

    @Column("float")
    servingSize!: number; // Tamaño de la porción para este alimento específico en esta comida
}
