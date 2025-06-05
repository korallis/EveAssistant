import { FittingCalculator } from '../FittingCalculator';
import { createFitting, createModule } from '../../test-data/fitting.factory';

describe('FittingCalculator', () => {
  it('should calculate DPS', () => {
    const fitting = createFitting({
      modules: [
        createModule({ typeName: 'Test Turret' }),
        createModule({ typeName: 'Test Launcher' }),
      ],
    });
    const calculator = new FittingCalculator(fitting);
    expect(calculator.calculateDps()).toBe(0);
  });
}); 