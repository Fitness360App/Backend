import { Request, Response } from 'express';
import { CalculatorService } from '../services/calculator.service';
import { UserService } from '../services/user.service';

class CalculatorController {
    private calculatorService: CalculatorService;
    private userService: UserService;

    constructor() {
        this.calculatorService = new CalculatorService();
        this.userService = new UserService();
    }

    public calculateIMCByUserData = async (req: Request, res: Response) => {
        try {
            const { uid } = req.params;
            const user = await this.userService.getUserDataByID(uid);
            if (!user) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            const imc = this.calculatorService.calculateIMCByUserData(user.actualWeight, user.height);
            return res.json({ imc });
        } catch (error) {
            return res.status(500).json({ error: "Error al calcular el IMC" });
        }
    };

    public calculateMacrosByUserData = async (req: Request, res: Response) => {
        try {
            const { uid } = req.params;
            const userData = await this.userService.getUserDataByID(uid);
            if (!userData) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            const macros = this.calculatorService.calculateMacrosByUserData(userData.goalWeight, userData.actualWeight, userData.height, userData.age, userData.gender, userData.activityLevel);
            return res.json({ macros });
        } catch (error) {
            return res.status(500).json({ error: "Error al calcular los macros" });
        }
    };

}

export default new CalculatorController();