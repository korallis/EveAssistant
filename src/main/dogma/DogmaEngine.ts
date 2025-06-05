import { DatabaseService } from '../db/DatabaseService';

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

    console.log(`Traversing expression ${expressionId}:`, expression);

    if (expression.arg1) {
      await this.traverseExpressionTree(expression.arg1);
    }

    if (expression.arg2) {
      await this.traverseExpressionTree(expression.arg2);
    }
  }
} 