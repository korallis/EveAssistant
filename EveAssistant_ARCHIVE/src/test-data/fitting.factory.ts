import { Fitting, Ship, IModule, IShip } from '../shared/domain';

export const createFitting = (overrides: Partial<Fitting> = {}): Fitting => {
  const ship = createShip();
  const fitting = new Fitting(ship);
  return Object.assign(fitting, overrides);
};

export const createShip = (overrides: Partial<IShip> = {}): Ship => {
  const shipData: IShip = {
    typeID: 123,
    typeName: 'Test Ship',
    groupID: 25,
    slots: {
      high: 4,
      mid: 4,
      low: 2,
      rig: 3,
      subsystem: 0,
    },
    attributes: {},
    bonuses: [],
    ...overrides,
  };
  return new Ship(shipData);
};

export const createModule = (overrides: Partial<IModule> = {}): IModule => {
  return {
    typeID: 456,
    typeName: 'Test Module',
    groupID: 1,
    attributes: {},
    effects: {},
    cpu: 10,
    powergrid: 5,
    ...overrides,
  };
};

// Specific ship types for different test scenarios
export const createFrigate = (overrides: Partial<IShip> = {}): Ship => {
  return createShip({
    typeName: 'Test Frigate',
    groupID: 25, // Frigate group
    slots: {
      high: 3,
      mid: 3,
      low: 2,
      rig: 3,
      subsystem: 0,
    },
    attributes: {
      // Example frigate attributes
      9: 1000,    // HP
      263: 500,   // Shield Capacity
      265: 350,   // Armor HP
    },
    ...overrides,
  });
};

export const createCruiser = (overrides: Partial<IShip> = {}): Ship => {
  return createShip({
    typeName: 'Test Cruiser',
    groupID: 26, // Cruiser group
    slots: {
      high: 5,
      mid: 4,
      low: 4,
      rig: 3,
      subsystem: 0,
    },
    attributes: {
      // Example cruiser attributes
      9: 2500,    // HP
      263: 1200,  // Shield Capacity
      265: 800,   // Armor HP
    },
    ...overrides,
  });
};

// Specific module types for different test scenarios
export const createWeaponModule = (overrides: Partial<IModule> = {}): IModule => {
  return createModule({
    typeName: 'Test Weapon',
    groupID: 53, // Example weapon group
    attributes: {
      // Example weapon attributes
      30: 100,    // Power requirement
      50: 10,     // CPU requirement
    },
    cpu: 10,
    powergrid: 100,
    ...overrides,
  });
};

export const createDefenseModule = (overrides: Partial<IModule> = {}): IModule => {
  return createModule({
    typeName: 'Test Shield Extender',
    groupID: 38, // Shield extender group
    attributes: {
      // Example defense module attributes
      68: 500,    // Shield bonus
    },
    cpu: 20,
    powergrid: 50,
    ...overrides,
  });
};

// Create a fitting with common modules for testing
export const createBasicFitting = (): Fitting => {
  const fitting = createFitting();
  fitting.addModule(createWeaponModule());
  fitting.addModule(createDefenseModule());
  return fitting;
}; 