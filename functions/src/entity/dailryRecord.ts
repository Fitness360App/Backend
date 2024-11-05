import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User2 } from './User';

@Entity()
export class DailyRecord2 {
    @PrimaryGeneratedColumn('uuid')
    registerID!: string; // ID del registro, generado automáticamente

    @Column()
    uid!: string; // ID del usuario

    @Column("date")
    date!: string; // Fecha del registro

    // Información nutricional
    @Column("float", { default: 0 })
    consumedCarbs!: number;

    @Column("float", { default: 0 })
    consumedProteins!: number;

    @Column("float", { default: 0 })
    consumedFats!: number;

    @Column("float", { default: 0 })
    consumedKcals!: number;

    @Column("int", { default: 0 })
    steps!: number; // Número de pasos

    @Column("float", { default: 0 })
    burnedKcals!: number; // Calorías quemadas

    // Relación con la entidad User, asumiendo que el modelo User existe
    @ManyToOne(() => User2, user => user.uid)
    @JoinColumn({ name: "uid" })
    user!: User2;
}