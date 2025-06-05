import { Ship, Fitting, IShip, IModule } from './domain';

describe('Domain Classes', () => {
  describe('Ship', () => {
    const mockShipData: IShip = {
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
      attributes: {
        9: 1000,   // HP
        263: 500,  // Shield Capacity
        265: 350,  // Armor HP
      },
      bonuses: ['Test bonus'],
    };

    it('should create a ship from valid data', () => {
      const ship = new Ship(mockShipData);
      expect(ship.typeID).toBe(123);
      expect(ship.typeName).toBe('Test Ship');
      expect(ship.groupID).toBe(25);
      expect(ship.slots.high).toBe(4);
      expect(ship.attributes[9]).toBe(1000);
      expect(ship.bonuses).toEqual(['Test bonus']);
    });

    it('should throw error for invalid ship data', () => {
      const invalidData = { ...mockShipData, typeID: 'invalid' };
      expect(() => new Ship(invalidData as any)).toThrow();
    });

    it('should create ship from SDE data', () => {
      const sdeData = {
        typeID: 456,
        name: { en: 'SDE Ship' },
        groupID: 26,
        dogmaAttributes: [
          { attributeID: 14, value: 6 }, // high slots
          { attributeID: 13, value: 5 }, // mid slots
          { attributeID: 12, value: 4 }, // low slots
          { attributeID: 1137, value: 3 }, // rig slots
          { attributeID: 1367, value: 0 }, // subsystem slots
          { attributeID: 9, value: 2000 }, // HP
        ],
        traits: {
          types: [
            { bonusText: { en: 'SDE bonus 1' } },
            { bonusText: { en: 'SDE bonus 2' } },
          ],
        },
      };

      const ship = Ship.createFromSde(sdeData);
      expect(ship.typeID).toBe(456);
      expect(ship.typeName).toBe('SDE Ship');
      expect(ship.groupID).toBe(26);
      expect(ship.slots.high).toBe(6);
      expect(ship.attributes[9]).toBe(2000);
      expect(ship.bonuses).toEqual(['SDE bonus 1', 'SDE bonus 2']);
    });

    it('should handle SDE data with missing attributes', () => {
      const sdeData = {
        typeID: 789,
        name: { en: 'Minimal Ship' },
        groupID: 27,
        dogmaAttributes: [],
      };

      const ship = Ship.createFromSde(sdeData);
      expect(ship.typeID).toBe(789);
      expect(ship.typeName).toBe('Minimal Ship');
      expect(ship.slots.high).toBe(0);
      expect(ship.bonuses).toEqual([]);
    });
  });

  describe('Fitting', () => {
    let ship: Ship;
    let fitting: Fitting;

    beforeEach(() => {
      const shipData: IShip = {
        typeID: 123,
        typeName: 'Test Ship',
        groupID: 25,
        slots: { high: 4, mid: 4, low: 2, rig: 3, subsystem: 0 },
        attributes: {},
        bonuses: [],
      };
      ship = new Ship(shipData);
      fitting = new Fitting(ship);
    });

    it('should create a fitting with a ship', () => {
      expect(fitting.ship).toBe(ship);
      expect(fitting.modules).toEqual([]);
      expect(fitting.charges).toEqual([]);
      expect(fitting.drones).toEqual([]);
      expect(fitting.implants).toEqual([]);
    });

    it('should add modules to fitting', () => {
      const module: IModule = {
        typeID: 456,
        typeName: 'Test Module',
        groupID: 1,
        attributes: {},
        effects: {},
        cpu: 10,
        powergrid: 5,
      };

      fitting.addModule(module);
      expect(fitting.modules).toHaveLength(1);
      expect(fitting.modules[0]).toBe(module);
    });

    it('should remove modules from fitting', () => {
      const module1: IModule = {
        typeID: 456,
        typeName: 'Test Module 1',
        groupID: 1,
        attributes: {},
        effects: {},
        cpu: 10,
        powergrid: 5,
      };

      const module2: IModule = {
        typeID: 789,
        typeName: 'Test Module 2',
        groupID: 2,
        attributes: {},
        effects: {},
        cpu: 15,
        powergrid: 8,
      };

      fitting.addModule(module1);
      fitting.addModule(module2);
      expect(fitting.modules).toHaveLength(2);

      fitting.removeModule(module1);
      expect(fitting.modules).toHaveLength(1);
      expect(fitting.modules[0]).toBe(module2);
    });

    it('should not remove modules that are not in the fitting', () => {
      const module1: IModule = {
        typeID: 456,
        typeName: 'Test Module 1',
        groupID: 1,
        attributes: {},
        effects: {},
        cpu: 10,
        powergrid: 5,
      };

      const module2: IModule = {
        typeID: 789,
        typeName: 'Test Module 2',
        groupID: 2,
        attributes: {},
        effects: {},
        cpu: 15,
        powergrid: 8,
      };

      fitting.addModule(module1);
      fitting.removeModule(module2); // This module was never added
      expect(fitting.modules).toHaveLength(1);
      expect(fitting.modules[0]).toBe(module1);
    });
  });
}); 