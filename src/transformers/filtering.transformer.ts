import { Transformer } from './types';

export enum FilterOperator {
  Equals = 'eq',
  NotEquals = 'neq',
  GreaterThan = 'gt',
  LessThan = 'lt',
  GreaterThanOrEqual = 'gte',
  LessThanOrEqual = 'lte',
  Contains = 'contains',
  Exists = 'exists',
}

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value?: any;
}

export class FilteringTransformer implements Transformer<any[], any[]> {
  async transform(data: any[], options: { conditions: FilterCondition[] }): Promise<any[]> {
    if (!Array.isArray(data) || !options || !options.conditions) {
      throw new Error('Invalid input for FilteringTransformer');
    }

    return data.filter((item) => {
      return options.conditions.every((condition) => this.matches(item, condition));
    });
  }

  private matches(item: any, condition: FilterCondition): boolean {
    const itemValue = this.getValueFromPath(item, condition.field);

    if (itemValue === undefined) {
      return condition.operator === FilterOperator.NotEquals && condition.value !== undefined;
    }

    switch (condition.operator) {
      case FilterOperator.Equals:
        return itemValue === condition.value;
      case FilterOperator.NotEquals:
        return itemValue !== condition.value;
      case FilterOperator.GreaterThan:
        return itemValue > condition.value;
      case FilterOperator.LessThan:
        return itemValue < condition.value;
      case FilterOperator.GreaterThanOrEqual:
        return itemValue >= condition.value;
      case FilterOperator.LessThanOrEqual:
        return itemValue <= condition.value;
      case FilterOperator.Contains:
        return Array.isArray(itemValue) && itemValue.includes(condition.value);
      case FilterOperator.Exists:
        return itemValue !== undefined;
      default:
        return false;
    }
  }

  private getValueFromPath(obj: any, path: string): any {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }
} 