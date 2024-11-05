import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Food2 } from './food';
import { User2 } from './User';

@Entity()
export class Meal2 {
    @PrimaryGeneratedColumn('uuid')
    id!: string; // Identificador único para la comida

    @Column({
        type: 'enum',
        enum: ['breakfast', 'lunch', 'snack', 'dinner', 'extras'],
    })
    type!: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'extras'; // Tipo de comida

    @ManyToMany(() => Food2, { cascade: true })
    @JoinTable()
    foods!: Food2[]; // Array de alimentos en la comida (relación many-to-many)

    @Column()
    uid!: string; // Identificador del usuario
}