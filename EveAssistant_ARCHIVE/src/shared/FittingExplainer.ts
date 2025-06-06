import { Fitting } from '../renderer/store/slices/fittingStore';
import templates from './explanationTemplates.json';

interface FittingAnalysis {
  strengths: string[];
  weaknesses: string[];
}

export class FittingExplainer {
  private fitting: Fitting;

  constructor(fitting: Fitting) {
    this.fitting = fitting;
  }

  public getExplanation(): string {
    const template = templates.default;
    return this.format(template);
  }

  public getAnalysis(): FittingAnalysis {
    return {
      strengths: ['High DPS', 'Good for close-range combat'],
      weaknesses: ['Low EHP', 'Vulnerable to kiting'],
    };
  }

  private format(template: string): string {
    return template.replace(/{(\w+(?:\.\w+)*)}/g, (match, key) => {
      const keys = key.split('.');
      let value: any = this;
      for (const k of keys) {
        value = value[k];
        if (value === undefined) {
          return match;
        }
      }
      return value;
    });
  }
} 