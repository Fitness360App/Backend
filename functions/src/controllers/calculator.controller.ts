import { Request, Response } from 'express';
import { CalculatorService } from '../services/calculator.service';

class CalculatorController {
    private calculatorService: CalculatorService;

    constructor() {
        this.calculatorService = new CalculatorService();
    }

    public calculateIMCByUserData = (req: Request, res: Response): void => {
        console.log(req.body);
        const { height, weight } = req.body;
        const imc = this.calculatorService.calculateIMCByUserData(weight, height);
        res.json({ imc });
    };

    public calculateMacrosByUserData = (req: Request, res: Response): void => {
        const { age, weight, height, gender, activityLevel } = req.body;
        const macros = this.calculatorService.calculateMacrosByUserData(weight, height, age, gender, activityLevel);
        res.json({ macros });
    };

    public getWeightGoal = (req: Request, res: Response): void => {
        const { currentWeight, goalWeight } = req.body;
        const weightGoal = this.calculatorService.getWeightGoal(currentWeight, goalWeight);
        res.json({ weightGoal });
    };
}

export default new CalculatorController();
