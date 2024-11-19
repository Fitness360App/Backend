import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { MealFood } from './mealfood';


@Entity()
export class Food2 {
    @PrimaryColumn()
    barcode!: string; // Código de barras del alimento

    @Column()
    name!: string; // Nombre del alimento

    @Column()
    brand!: string; // Marca del alimento

    @Column("float")
    servingSize!: number; // Tamaño de la porción (en gramos o mililitros)

    // Información nutricional
    @Column("float", { default: 0 })
    carbs!: number;

    @Column("float", { default: 0 })
    proteins!: number;

    @Column("float", { default: 0 })
    fats!: number;

    @Column("float", { default: 0 })
    kcals!: number;

    @OneToMany(() => MealFood, mealFood => mealFood.food)
    mealFoods!: MealFood[]; // Relación con MealFood

    @Column({ nullable: true }) // Permite valores nulos inicialmente
    imagePath?: string;
}