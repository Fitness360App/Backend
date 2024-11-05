import { Entity, PrimaryColumn, Column } from 'typeorm';

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
}
