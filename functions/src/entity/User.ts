import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User2 {
    @PrimaryGeneratedColumn('uuid')
    uid!: string; // UID en formato UUID para mayor seguridad

    @Column({ unique: true })
    email!: string; // Correo único

    @Column()
    passwordHash!: string; // Contraseña hasheada

    @Column()
    name!: string;

    @Column()
    lastName1!: string;

    @Column()
    lastName2!: string;

    @Column("float")
    actualWeight!: number;

    @Column("float")
    goalWeight!: number;

    @Column("float")
    height!: number;

    @Column("int")
    age!: number;

    @Column()
    gender!: string;

    @Column()
    activityLevel!: string;

    @Column()
    role!: string;

    // Subdocumento macros
    @Column("float", { default: 0 })
    carbs!: number;

    @Column("float", { default: 0 })
    proteins!: number;

    @Column("float", { default: 0 })
    fats!: number;

    @Column("float", { default: 0 })
    kcals!: number;

    get macros() {
        return {
            carbs: this.carbs,
            proteins: this.proteins,
            fats: this.fats,
            kcals: this.kcals,
        };
    }
}
