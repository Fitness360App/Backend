import { firestore } from 'firebase-admin';


import { User } from '../models/user.model';
import { UnknownErrorException } from '../utils/exceptions/unknownErrorException';
import { UserNotFoundException } from '../utils/exceptions/userNotFoundException';
import { User2} from '../entity/User';
import { AppDataSource } from '../ormconfig';
import { DailyRecordService } from './dailyRecord.service';
import { MealService } from './meal.service';
import * as bcrypt from 'bcrypt';
import  nodemailer from 'nodemailer';


export class UserService {

    private dailyRecordService: DailyRecordService;
    private mealService: MealService;

    constructor() {
        this.dailyRecordService = new DailyRecordService();
        this.mealService = new MealService();
    }


    async getUserDataByID(id_usuario: string): Promise<User | null> {
        try {
            // Obtiene el repositorio de User
            const userRepository = AppDataSource.getRepository(User2);
    
            // Intenta obtener el usuario por su ID
            const user = await userRepository.findOneBy({ uid: id_usuario });
    
            if (!user) {
                throw new UserNotFoundException('Usuario no encontrado'); // Si no se encuentra el usuario
            }
            console.log(user);
            return user; // Retorna los datos del usuario si existe
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new UserNotFoundException(`Error al obtener los datos del usuario: ${error.message}`);
            } else {
                throw new UnknownErrorException('Error desconocido al obtener los datos del usuario'); // Manejo de errores no esperados
            }
        }
    }

    // Método para obtener solo los objetivos del usuario
    async getUserGoals(id_usuario: string): Promise<{ macros: { carbs: number; proteins: number; fats: number; kcals: number }; goalWeight: number } | null> {
        try {
            // Obtén el repositorio de User
            const userRepository = AppDataSource.getRepository(User2);
    
            // Busca al usuario por ID
            const user = await userRepository.findOneBy({ uid: id_usuario });
    
            // Si no se encuentra el usuario, lanza una excepción
            if (!user) {
                throw new UserNotFoundException('Usuario no encontrado');
            }
    
            // Devuelve solo los objetivos del usuario (macros y goalWeight)
            return {
                macros: {
                    carbs: user.carbs,
                    proteins: user.proteins,
                    fats: user.fats,
                    kcals: user.kcals,
                },
                goalWeight: user.goalWeight,
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new UserNotFoundException(`Error al obtener los objetivos del usuario: ${error.message}`);
            } else {
                throw new UnknownErrorException('Error desconocido al obtener los objetivos del usuario');
            }
        }
    }


    async modifyUserData(uid: string, updatedData: Partial<Omit<User2, 'uid' | 'role' | 'macros'>>): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(User2);
            
            // Verifica si el usuario existe
            const user = await userRepository.findOneBy({ uid });
            if (!user) {
                throw new UserNotFoundException('Usuario no encontrado');
            }
    
            // Actualiza solo los campos permitidos
            await userRepository.update(uid, updatedData);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new UserNotFoundException(`Error al modificar los datos del usuario: ${error.message}`);
            } else {
                throw new UnknownErrorException('Error desconocido al modificar los datos del usuario');
            }
        }
    }


    async modifyUserGoals(uid: string, updatedGoals: { carbs: number; proteins: number; fats: number; kcals: number }): Promise<void> {
        const userRepository = AppDataSource.getRepository(User2);

        console.log(userRepository)
        
        console.log("==================================")

        console.log("HOLA2")


        // Verifica si el usuario existe
        const user = await userRepository.findOneBy({ uid });
        if (!user) {
            throw new UserNotFoundException('Usuario no encontrado');
        }
    
        console.log("Esto es el updatedGoals:",updatedGoals)
        // Actualiza los macros
        await userRepository.update(uid, {
            carbs: updatedGoals.carbs,
            proteins: updatedGoals.proteins,
            fats: updatedGoals.fats,
            kcals: updatedGoals.kcals
        });
    }

    async isUserAdmin(uid: string): Promise<boolean> {
        try {
            // Obtiene el repositorio de usuarios de TypeORM
            const userRepository = AppDataSource.getRepository(User2);

            // Busca el usuario por `uid`
            const user = await userRepository.findOneBy({ uid });
            
            // Si el usuario no existe, lanza una excepción
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Retorna `true` si el rol es "admin", de lo contrario `false`
            return user.role === 'admin';
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Error al verificar el rol del usuario: ${error.message}`);
            } else {
                throw new Error('Error desconocido al verificar el rol del usuario');
            }
        }
    }
    
    async deleteUser(uid: string): Promise<void> {
        try {
            // Obtiene el repositorio de usuarios de TypeORM
            const userRepository = AppDataSource.getRepository(User2);

            // Busca el usuario por `uid`
            const user = await userRepository.findOneBy({ uid });
            
            // Si el usuario no existe, lanza una excepción
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

           
            // Elimina al usuario y todos sus meals y dailyrecords asociados (deleteAllDailyRecords y deleteAllMeals)
            await this.dailyRecordService.deleteAllDailyRecords(uid);
            await this.mealService.deleteAllMeals(uid);
            await userRepository.remove(user);

        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Error al eliminar el usuario: ${error.message}`);
            } else {
                throw new Error('Error desconocido al eliminar el usuario');
            }
        }
    }
    
    async checkUserEmail(email: string): Promise<boolean> {
        const userRepository = AppDataSource.getRepository(User2);

        const user = await userRepository.findOneBy({ email });

        return !!user;
    }

    async sendEmailConfirmation(uid: string, password: string): Promise<string> {
        try {
            const userRepository = AppDataSource.getRepository(User2);
    
            // Obtener el usuario por ID
            const user = await userRepository.findOneBy({ uid });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
    
            // Genera un código de validación (puedes modificar la generación del código según lo necesites)
            const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    
            // Actualiza la contraseña del usuario
            const passwordHash = await bcrypt.hash(password, 10);
            await userRepository.update(uid, { passwordHash: passwordHash });

            // Configura Nodemailer para enviar el correo
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,  // O usa el puerto 587 si estás usando STARTTLS
                secure: false,  // true para 465, false para 587
                auth: {
                    user: 'admonfitness360@gmail.com',
                    pass: 'nmsl tqan dugo jbmw', // Usa la contraseña de aplicación
                },
                tls: {
                    rejectUnauthorized: false, // Desactiva la validación del certificado (no recomendado en producción)
                }
            });


    
            const mailOptions = {
                from: 'admonfitness360@gmail.com',
                to: user.email,
                subject: 'Código de Validación',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h1 style="color: #4CAF50;">Código de Validación</h1>
                        <p>Hola ${user.name},</p>
                        <p>Este es tu código de validación:</p>
                        <h2 style="color: #FF5722;">${generatedCode}</h2>
                        <p>Por favor, usa este código para completar tu proceso de cambio de contraseña.</p>
                        <p>Gracias,</p>
                        <p>El equipo de Fitness360</p>
                    </div>
                `,
            };

    
            // Envía el correo
            await transporter.sendMail(mailOptions);
    
            return generatedCode;
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log(error.message);
                throw new Error(`Error al cambiar la contraseña del usuario: ${error.message}`);
            } else {
                throw new Error('Error desconocido al cambiar la contraseña del usuario');
            }
        }
    }

    async changePassword(uid: string, newPassword: string): Promise<void> {
        try {
            const userRepository = AppDataSource.getRepository(User2);

            // Obtiene el usuario por ID
            const user = await userRepository.findOneBy({ uid });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            const newpasswordHash = await bcrypt.hash(newPassword, 10);
            user.passwordHash = newpasswordHash;
            
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log(error)
                throw new Error(`Error al cambiar la contraseña del usuario: ${error.message}`);
            } else {
                throw new Error('Error desconocido al cambiar la contraseña del usuario');
            }
        }
    }   
}
