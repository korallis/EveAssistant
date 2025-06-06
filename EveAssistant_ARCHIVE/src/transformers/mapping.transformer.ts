import { Transformer } from './types';

export interface MappingConfig {
  [targetField: string]: string; // a.b.c
}

export class MappingTransformer implements Transformer<any, any> {
  async transform(data: any, options: { mapping: MappingConfig }): Promise<any> {
    if (!data || !options || !options.mapping) {
      throw new Error('Invalid input for MappingTransformer');
    }

    const transformedData: { [key: string]: any } = {};

    for (const targetField in options.mapping) {
      const sourcePath = options.mapping[targetField];
      const sourceValue = this.getValueFromPath(data, sourcePath);

      if (sourceValue !== undefined) {
        transformedData[targetField] = sourceValue;
      }
    }

    return transformedData;
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