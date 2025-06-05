import { DatabaseService } from '../db/DatabaseService';
import { operands } from '../../shared/operands';

export class DogmaEngine {
  private static instance: DogmaEngine;

  private constructor() {}

  public static getInstance(): DogmaEngine {
    if (!DogmaEngine.instance) {
      DogmaEngine.instance = new DogmaEngine();
    }
    return DogmaEngine.instance;
  }

  public async traverseExpressionTree(expressionId: number): Promise<void> {
    const dbService = DatabaseService.getInstance();
    const expression = await dbService.dogmaExpressionRepository.findOne({ where: { expressionID: expressionId } });

    if (!expression) {
      console.warn(`Expression with ID ${expressionId} not found.`);
      return;
    }

    this.interpretExpression(expression);

    if (expression.arg1) {
      await this.traverseExpressionTree(expression.arg1);
    }

    if (expression.arg2) {
      await this.traverseExpressionTree(expression.arg2);
    }
  }

  private interpretExpression(expression: any): void {
    const operand = operands[expression.operandID];
    if (operand) {
      console.log(`Interpreting expression ${expression.expressionID}: ${operand.key}`);
    } else {
      console.warn(`Unknown operand ID: ${expression.operandID}`);
    }
  }
} 