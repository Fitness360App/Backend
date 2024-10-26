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

    public calculateIMCByUserData = async (req: Request, res: Response): Promise<void> => {
        try {
            const { uid } = req.body;
            const userData = await this.userService.getUserDataByID(uid); 
            const imc = this.calculatorService.calculateIMCByUserData(userData.actualWeight, userData.height);
            res.json({ imc });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "An error occurred while calculating IMC" });
        }
    };

    public calculateMacrosByUserData = async (req: Request, res: Response): Promise<void> => {
        try {
            const { uid } = req.body;
            const userData = await this.userService.getUserDataByID(uid);
            const macros = this.calculatorService.calculateMacrosByUserData(userData.goalWeight, userData.actualWeight, userData.height, userData.age, userData.gender, userData.activityLevel);
            res.json({ macros });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "An error occurred while calculating macros" });
        }
    };

}

export default new CalculatorController();
