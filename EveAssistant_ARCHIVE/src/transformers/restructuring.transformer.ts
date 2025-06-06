import { Transformer } from './types';

export enum RestructureOperation {
  GroupBy = 'groupBy',
  Flatten = 'flatten',
}

export interface RestructureConfig {
  operation: RestructureOperation;
  key: string;
  // For flatten, specifies which field to flatten.
  // For groupBy, specifies the key to group by.
}

export class RestructuringTransformer implements Transformer<any, any> {
  async transform(data: any, options: { config: RestructureConfig }): Promise<any> {
    if (!data || !options || !options.config) {
      throw new Error('Invalid input for RestructuringTransformer');
    }

    switch (options.config.operation) {
      case RestructureOperation.GroupBy:
        return this.groupBy(data, options.config.key);
      case RestructureOperation.Flatten:
        return this.flatten(data, options.config.key);
      default:
        throw new Error(`Unsupported restructure operation: ${options.config.operation}`);
    }
  }

  private groupBy(data: any[], key: string): { [key: string]: any[] } {
    if (!Array.isArray(data)) {
      throw new Error('GroupBy operation requires an array input.');
    }
    return data.reduce((acc, item) => {
      const groupKey = item[key];
      if (groupKey) {
        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(item);
      }
      return acc;
    }, {});
  }

  private flatten(data: any[], key: string): any[] {
     if (!Array.isArray(data)) {
      throw new Error('Flatten operation requires an array input.');
    }
    return data.flatMap(item => (item[key] && Array.isArray(item[key])) ? item[key] : []);
  }
} 