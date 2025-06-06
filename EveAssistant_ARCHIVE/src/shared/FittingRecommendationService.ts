import { FittingOptimizer, GoalWeights } from './FittingOptimizer';
import { Fitting } from '../renderer/store/slices/fittingStore';
import { Ship } from '../renderer/store/slices/shipStore';

export type Strategy = 'Max Range' | 'Close Range' | 'Speed Tanking' | 'All Round';

export class FittingRecommendationService {
  private optimizer: FittingOptimizer;

  constructor(ship: Ship, modules: any[]) {
    this.optimizer = new FittingOptimizer(ship, modules, [], 50, 0.8, 0.1, 50, {} as any);
  }

  public getRecommendedFittings(strategy: Strategy): Fitting[] {
    const weights = this.getWeightsForStrategy(strategy);
    this.optimizer.setWeights(weights);
    return this.optimizer.run();
  }

  private getWeightsForStrategy(strategy: Strategy): GoalWeights {
    switch (strategy) {
      case 'Max Range':
        return { dps: 0.3, tank: 0.2, capacitor: 0.1, speed: 0.1, range: 0.3 };
      case 'Close Range':
        return { dps: 0.5, tank: 0.3, capacitor: 0.1, speed: 0.1, range: 0.0 };
      case 'Speed Tanking':
        return { dps: 0.1, tank: 0.2, capacitor: 0.1, speed: 0.5, range: 0.1 };
      case 'All Round':
        return { dps: 0.25, tank: 0.25, capacitor: 0.25, speed: 0.25, range: 0.0 };
    }
  }
} 