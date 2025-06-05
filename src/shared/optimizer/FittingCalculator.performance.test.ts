import { FittingCalculator } from '../FittingCalculator';
import { Ship, Fitting } from '../domain';
import { IModule, IShip } from '../types/domain.types';
import { Attributes } from '../attributes';

describe('FittingCalculator performance', () => {
  it('should calculate EHP in under 1ms', () => {
    const attributes = Attributes.getInstance();
    const shipData: IShip = {
      typeID: 603,
      typeName: 'Kestrel',
      groupID: 25,
      slots: {
        high: 4,
        mid: 4,
        low: 2,
        rig: 3,
        subsystem: 0,
      },
      attributes: {
        [attributes.get('shieldCapacity') as number]: 1000,
        [attributes.get('armorHP') as number]: 500,
        [attributes.get('hp') as number]: 250,
        [attributes.get('shieldEmDamageResonance') as number]: 0,
        [attributes.get('shieldThermalDamageResonance') as number]: 0.2,
        [attributes.get('shieldKineticDamageResonance') as number]: 0.4,
        [attributes.get('shieldExplosiveDamageResonance') as number]: 0.5,
        [attributes.get('armorEmDamageResonance') as number]: 0.5,
        [attributes.get('armorThermalDamageResonance') as number]: 0.45,
        [attributes.get('armorKineticDamageResonance') as number]: 0.25,
        [attributes.get('armorExplosiveDamageResonance') as number]: 0.1,
        [attributes.get('hullEmDamageResonance') as number]: 0,
        [attributes.get('hullThermalDamageResonance') as number]: 0,
        [attributes.get('hullKineticDamageResonance') as number]: 0,
        [attributes.get('hullExplosiveDamageResonance') as number]: 0,
      },
      bonuses: [],
    };
    const ship = new Ship(shipData);
    const fitting = new Fitting(ship);
    const moduleData: IModule = {
      typeID: 3829,
      typeName: 'Medium Shield Extender I',
      groupID: 38,
      attributes: {
        [attributes.get('shieldBonus') as number]: 500,
      },
      effects: {},
      cpu: 0,
      powergrid: 0,
    };
    fitting.addModule(moduleData);
    const calculator = new FittingCalculator(fitting);

    const startTime = performance.now();
    calculator.calculateEhp();
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(1);
  });
}); 