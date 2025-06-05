import { Transformer } from './types';
import { MappingTransformer, MappingConfig } from './mapping.transformer';
import { FilteringTransformer, FilterCondition } from './filtering.transformer';
import { RestructuringTransformer, RestructureConfig } from './restructuring.transformer';

enum TransformerType {
  Map = 'map',
  Filter = 'filter',
  Restructure = 'restructure',
}

interface TransformerConfig {
  type: TransformerType;
  options: MappingConfig | { conditions: FilterCondition[] } | { config: RestructureConfig };
}

export class TransformerPipeline {
  private transformers: Transformer<any, any>[] = [];
  private configs: TransformerConfig[] = [];

  constructor(pipelineConfig: TransformerConfig[]) {
    this.configs = pipelineConfig;
    this.initializeTransformers();
  }

  private initializeTransformers() {
    for (const config of this.configs) {
      switch (config.type) {
        case TransformerType.Map:
          this.transformers.push(new MappingTransformer());
          break;
        case TransformerType.Filter:
          this.transformers.push(new FilteringTransformer());
          break;
        case TransformerType.Restructure:
          this.transformers.push(new RestructuringTransformer());
          break;
        default:
          throw new Error(`Unknown transformer type: ${config.type}`);
      }
    }
  }

  async run(initialData: any): Promise<any> {
    let data = initialData;
    for (let i = 0; i < this.transformers.length; i++) {
      const transformer = this.transformers[i];
      const config = this.configs[i];
      data = await transformer.transform(data, config.options);
    }
    return data;
  }
} 