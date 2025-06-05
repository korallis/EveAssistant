import { 
  createFitting, 
  createShip, 
  createModule,
  createFrigate,
  createCruiser,
  createWeaponModule,
  createDefenseModule,
  createBasicFitting
} from './fitting.factory';

describe('Fitting Factory', () => {
  it('should create a basic fitting', () => {
    const fitting = createFitting();
    expect(fitting.ship.typeName).toBe('Test Ship');
    expect(fitting.modules).toEqual([]);
  });

  it('should create a ship with custom properties', () => {
    const ship = createShip({ typeName: 'Custom Ship' });
    expect(ship.typeName).toBe('Custom Ship');
    expect(ship.typeID).toBe(123);
  });

  it('should create a module with custom properties', () => {
    const module = createModule({ typeName: 'Custom Module' });
    expect(module.typeName).toBe('Custom Module');
    expect(module.typeID).toBe(456);
  });

  it('should create a frigate with proper attributes', () => {
    const frigate = createFrigate();
    expect(frigate.typeName).toBe('Test Frigate');
    expect(frigate.slots.high).toBe(3);
    expect(frigate.attributes[9]).toBe(1000); // HP
  });

  it('should create a cruiser with proper attributes', () => {
    const cruiser = createCruiser();
    expect(cruiser.typeName).toBe('Test Cruiser');
    expect(cruiser.slots.high).toBe(5);
    expect(cruiser.attributes[9]).toBe(2500); // HP
  });

  it('should create specialized modules', () => {
    const weapon = createWeaponModule();
    const defense = createDefenseModule();
    
    expect(weapon.typeName).toBe('Test Weapon');
    expect(defense.typeName).toBe('Test Shield Extender');
    expect(weapon.powergrid).toBe(100);
    expect(defense.powergrid).toBe(50);
  });

  it('should create a basic fitting with modules', () => {
    const fitting = createBasicFitting();
    expect(fitting.modules).toHaveLength(2);
    expect(fitting.modules[0].typeName).toBe('Test Weapon');
    expect(fitting.modules[1].typeName).toBe('Test Shield Extender');
  });
}); 