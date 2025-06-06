import { DatabaseService } from '../db/DatabaseService';

export class FittingDataService {
  private static instance: FittingDataService;
  private attributeCache: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): FittingDataService {
    if (!FittingDataService.instance) {
      FittingDataService.instance = new FittingDataService();
    }
    return FittingDataService.instance;
  }

  public async getAttributeId(name: string): Promise<number | undefined> {
    if (this.attributeCache.has(name)) {
      return this.attributeCache.get(name);
    }

    const dbService = DatabaseService.getInstance();
    const attribute = await dbService.findDogmaAttributeByName(name);

    if (attribute) {
      this.attributeCache.set(name, attribute.attributeID);
      return attribute.attributeID;
    }

    return undefined;
  }
} 