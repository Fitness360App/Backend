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


        // Verifica si el usuario existe
        const user = await userRepository.findOneBy({ uid });
        if (!user) {
            throw new UserNotFoundException('Usuario no encontrado');
        }
    
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
                <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f0f4f8; padding: 20px; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: #005a9e; color: white; padding: 15px 20px; border-top-left-radius: 10px; border-top-right-radius: 10px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Fitness360</h1>
                        </div>
                        <div style="padding: 20px;">
                            <p style="font-size: 16px; color: #333;">Hola <strong>${user.name}</strong>,</p>
                            <p style="font-size: 16px; color: #333;">Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para completar el proceso:</p>
                            <div style="text-align: center; margin: 20px 0;">
                                <span style="display: inline-block; font-size: 28px; color: #005a9e; font-weight: bold; padding: 10px 20px; border: 2px solid #005a9e; border-radius: 5px; background-color: #f0f4f8;">
                                    ${generatedCode}
                                </span>
                            </div>
                            <p style="font-size: 16px; color: #333;">Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña seguirá segura.</p>
                            <p style="margin-top: 30px; font-size: 14px; color: #666;">Gracias por usar Fitness360. Estamos aquí para ayudarte a alcanzar tus metas.</p>
                        </div>
                        <div style="background-color: #005a9e; padding: 15px 20px; text-align: center; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; color: white; font-size: 12px;">
                            &copy; ${new Date().getFullYear()} Fitness360. Todos los derechos reservados.
                        </div>
                    </div>
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

    async sendEmailConfirmationByMail(email: string){
        try {
            const userRepository = AppDataSource.getRepository(User2);
    
            // Obtener el usuario por email
            const user = await userRepository.findOneBy({ email });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
    
            // Genera un código de validación (puedes modificar la generación del código según lo necesites)
            const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
            
    
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
                <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f0f4f8; padding: 20px; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                        <div style="background-color: #005a9e; color: white; padding: 15px 20px; border-top-left-radius: 10px; border-top-right-radius: 10px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Fitness360</h1>
                        </div>
                        <div style="padding: 20px;">
                            <p style="font-size: 16px; color: #333;">Hola <strong>${user.name}</strong>,</p>
                            <p style="font-size: 16px; color: #333;">Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para completar el proceso:</p>
                            <div style="text-align: center; margin: 20px 0;">
                                <span style="display: inline-block; font-size: 28px; color: #005a9e; font-weight: bold; padding: 10px 20px; border: 2px solid #005a9e; border-radius: 5px; background-color: #f0f4f8;">
                                    ${generatedCode}
                                </span>
                            </div>
                            <p style="font-size: 16px; color: #333;">Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña seguirá segura.</p>
                            <p style="margin-top: 30px; font-size: 14px; color: #666;">Gracias por usar Fitness360. Estamos aquí para ayudarte a alcanzar tus metas.</p>
                        </div>
                        <div style="background-color: #005a9e; padding: 15px 20px; text-align: center; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; color: white; font-size: 12px;">
                            &copy; ${new Date().getFullYear()} Fitness360. Todos los derechos reservados.
                        </div>
                    </div>
                </div>
                `,
            };

    
            // Envía el correo
            await transporter.sendMail(mailOptions);
    
            return { uid: user.uid, validationCode: generatedCode };
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

            const passwordHash = await bcrypt.hash(newPassword, 10);
            await userRepository.update(uid, { passwordHash: passwordHash });
            
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
