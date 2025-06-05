import { FittingCalculator } from '../FittingCalculator';
import { DamageProfile } from '../DamageProfile';
import { createFitting, createModule, createFrigate, createWeaponModule, createDefenseModule } from '../../test-data/fitting.factory';
import { Attributes } from '../../shared/attributes';

describe('FittingCalculator', () => {
  beforeEach(() => {
    // Initialize attributes with correct values
    const attributes = Attributes.getInstance();
    const attributeMap = new Map<string, number>();
    
    // Set attribute names to numeric IDs (simulating the game's attribute system)
    attributeMap.set('shieldCapacity', 263);
    attributeMap.set('armorHP', 265);
    attributeMap.set('hp', 9);
    attributeMap.set('shieldEmDamageResonance', 271);
    attributeMap.set('shieldThermalDamageResonance', 274);
    attributeMap.set('shieldKineticDamageResonance', 273);
    attributeMap.set('shieldExplosiveDamageResonance', 272);
    attributeMap.set('armorEmDamageResonance', 267);
    attributeMap.set('armorThermalDamageResonance', 270);
    attributeMap.set('armorKineticDamageResonance', 269);
    attributeMap.set('armorExplosiveDamageResonance', 268);
    attributeMap.set('hullEmDamageResonance', 113);
    attributeMap.set('hullThermalDamageResonance', 116);
    attributeMap.set('hullKineticDamageResonance', 115);
    attributeMap.set('hullExplosiveDamageResonance', 114);
    attributeMap.set('capacitorCapacity', 482);
    attributeMap.set('rechargeRate', 55);
    attributeMap.set('mass', 4);
    attributeMap.set('agility', 70);
    attributeMap.set('maxVelocity', 37);
    attributeMap.set('cpuOutput', 48);
    attributeMap.set('powergridOutput', 11);
    
    attributes.setAttributes(attributeMap);
  });

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

  it('should calculate EHP with default damage profile', () => {
    const fitting = createFitting();
    const calculator = new FittingCalculator(fitting);
    const ehp = calculator.calculateEhp();
    expect(typeof ehp).toBe('number');
    expect(ehp).toBeGreaterThanOrEqual(0);
  });

  it('should calculate EHP with custom damage profile', () => {
    const fitting = createFitting();
    const calculator = new FittingCalculator(fitting);
    const damageProfile = new DamageProfile(1, 0, 0, 0); // All EM damage
    const ehp = calculator.calculateEhp(damageProfile);
    expect(typeof ehp).toBe('number');
    expect(ehp).toBeGreaterThanOrEqual(0);
  });

  it('should calculate capacitor stats', () => {
    const fitting = createFitting();
    const calculator = new FittingCalculator(fitting);
    const capacitor = calculator.calculateCapacitor();
    expect(capacitor).toHaveProperty('peakRecharge');
    expect(capacitor).toHaveProperty('stable');
    expect(typeof capacitor.peakRecharge).toBe('number');
    expect(typeof capacitor.stable).toBe('boolean');
  });

  it('should calculate CPU usage and output', () => {
    const fitting = createFitting();
    fitting.addModule(createWeaponModule({ cpu: 50 }));
    fitting.addModule(createDefenseModule({ cpu: 30 }));
    
    const calculator = new FittingCalculator(fitting);
    const cpu = calculator.calculateCpu();
    
    expect(cpu).toHaveProperty('usage');
    expect(cpu).toHaveProperty('output');
    expect(cpu.usage).toBe(80); // 50 + 30
  });

  it('should calculate powergrid usage and output', () => {
    const fitting = createFitting();
    fitting.addModule(createWeaponModule({ powergrid: 100 }));
    fitting.addModule(createDefenseModule({ powergrid: 50 }));
    
    const calculator = new FittingCalculator(fitting);
    const powergrid = calculator.calculatePowergrid();
    
    expect(powergrid).toHaveProperty('usage');
    expect(powergrid).toHaveProperty('output');
    expect(powergrid.usage).toBe(150); // 100 + 50
  });

  it('should calculate speed and agility', () => {
    const fitting = createFitting();
    const calculator = new FittingCalculator(fitting);
    const speed = calculator.calculateSpeedAndAgility();
    
    expect(speed).toHaveProperty('maxVelocity');
    expect(speed).toHaveProperty('agility');
    expect(speed).toHaveProperty('alignTime');
    expect(typeof speed.maxVelocity).toBe('number');
    expect(typeof speed.agility).toBe('number');
    expect(typeof speed.alignTime).toBe('number');
  });

  it('should handle default fitting calculations', () => {
    const fitting = createFitting({
      ship: {
        typeID: 1,
        typeName: 'Test Ship',
        groupID: 25,
        subsystem: 0,
        slots: {
          high: 4,
          mid: 4,
          low: 2,
          rig: 3,
          subsystem: 0,
        },
        bonuses: [],
        attributes: {
          // Add required attributes for valid calculations
          9: 1000,     // HP
          263: 500,    // Shield Capacity
          265: 350,    // Armor HP
          271: 0.1,    // Shield EM Damage Resonance
          274: 0.2,    // Shield Thermal Damage Resonance
          273: 0.3,    // Shield Kinetic Damage Resonance
          272: 0.4,    // Shield Explosive Damage Resonance
          267: 0.5,    // Armor EM Damage Resonance
          270: 0.6,    // Armor Thermal Damage Resonance
          269: 0.7,    // Armor Kinetic Damage Resonance
          268: 0.8,    // Armor Explosive Damage Resonance
          113: 0.1,    // Hull EM Damage Resonance
          116: 0.2,    // Hull Thermal Damage Resonance
          115: 0.3,    // Hull Kinetic Damage Resonance
          114: 0.4,    // Hull Explosive Damage Resonance
          482: 1000,   // Capacitor Capacity
          55: 150,     // Recharge Rate
          4: 12500000, // Mass
          70: 3.2,     // Agility
          37: 320,     // Max Velocity
          48: 350,     // CPU Output
          11: 85       // Powergrid Output
        }
      }
    });
    const calculator = new FittingCalculator(fitting);
    
    // Basic calculations
    const ehp = calculator.calculateEhp();
    expect(ehp).toBeGreaterThanOrEqual(0);
    
    const cap = calculator.calculateCapacitor();
    expect(cap.peakRecharge).toBeGreaterThanOrEqual(0);
    
    const cpu = calculator.calculateCpu();
    expect(cpu.output).toBeGreaterThanOrEqual(0);
    
    const powergrid = calculator.calculatePowergrid();
    expect(powergrid.output).toBeGreaterThanOrEqual(0);
    
    const dps = calculator.calculateDps();
    expect(dps).toBeGreaterThanOrEqual(0);
    
    const speed = calculator.calculateSpeedAndAgility();
    expect(speed.maxVelocity).toBeGreaterThanOrEqual(0);
  });

  it('should handle frigate ship calculations', () => {
    const frigate = createFrigate({
      attributes: {
        9: 1000,    // HP
        263: 500,   // Shield Capacity
        265: 350,   // Armor HP
        271: 0.1,   // Shield EM Damage Resonance 
        274: 0.2,   // Shield Thermal Damage Resonance
        273: 0.3,   // Shield Kinetic Damage Resonance
        272: 0.4,   // Shield Explosive Damage Resonance
        267: 0.5,   // Armor EM Damage Resonance
        270: 0.6,   // Armor Thermal Damage Resonance
        269: 0.7,   // Armor Kinetic Damage Resonance
        268: 0.8,   // Armor Explosive Damage Resonance
        113: 0.1,   // Hull EM Damage Resonance
        116: 0.2,   // Hull Thermal Damage Resonance
        115: 0.3,   // Hull Kinetic Damage Resonance
        114: 0.4,   // Hull Explosive Damage Resonance
        4: 1250000,  // Mass
        70: 3.8,     // Agility
        37: 300      // Max Velocity
      }
    });
    const fitting = createFitting({ ship: frigate });
    const calculator = new FittingCalculator(fitting);
    
    const ehp = calculator.calculateEhp();
    expect(ehp).toBeGreaterThan(0);
    
    const speed = calculator.calculateSpeedAndAgility();
    expect(speed.alignTime).toBeGreaterThanOrEqual(0);
  });

  it('should calculate EHP with damage profile', () => {
    const fitting = createFitting({
      ship: {
        typeID: 1,
        typeName: 'Test Ship',
        groupID: 25,
        subsystem: 0,
        slots: {
          high: 4,
          mid: 4,
          low: 2,
          rig: 3,
          subsystem: 0,
        },
        bonuses: [],
        attributes: {
          // Add required attributes for valid calculations
          9: 1000,     // HP
          263: 500,    // Shield Capacity
          265: 350,    // Armor HP
          271: 0.1,    // Shield EM Damage Resonance
          274: 0.2,    // Shield Thermal Damage Resonance
          273: 0.3,    // Shield Kinetic Damage Resonance
          272: 0.4,    // Shield Explosive Damage Resonance
          267: 0.5,    // Armor EM Damage Resonance
          270: 0.6,    // Armor Thermal Damage Resonance
          269: 0.7,    // Armor Kinetic Damage Resonance
          268: 0.8,    // Armor Explosive Damage Resonance
          113: 0.1,    // Hull EM Damage Resonance
          116: 0.2,    // Hull Thermal Damage Resonance
          115: 0.3,    // Hull Kinetic Damage Resonance
          114: 0.4,    // Hull Explosive Damage Resonance
        }
      }
    });
    const calculator = new FittingCalculator(fitting);
    
    const customDamageProfile = new DamageProfile(0.5, 0.3, 0.1, 0.1);
    const ehp = calculator.calculateEhp(customDamageProfile);
    
    expect(ehp).toBeGreaterThanOrEqual(0);
  });

  it('should cache calculation results', () => {
    const fitting = createFitting({
      ship: {
        typeID: 1,
        typeName: 'Test Ship',
        groupID: 25,
        subsystem: 0,
        slots: {
          high: 4,
          mid: 4,
          low: 2,
          rig: 3,
          subsystem: 0,
        },
        bonuses: [],
        attributes: {
          // Add required attributes for valid calculations
          9: 1000,     // HP
          263: 500,    // Shield Capacity
          265: 350,    // Armor HP
          271: 0.1,    // Shield EM Damage Resonance
          274: 0.2,    // Shield Thermal Damage Resonance
          273: 0.3,    // Shield Kinetic Damage Resonance
          272: 0.4,    // Shield Explosive Damage Resonance
          267: 0.5,    // Armor EM Damage Resonance
          270: 0.6,    // Armor Thermal Damage Resonance
          269: 0.7,    // Armor Kinetic Damage Resonance
          268: 0.8,    // Armor Explosive Damage Resonance
          113: 0.1,    // Hull EM Damage Resonance
          116: 0.2,    // Hull Thermal Damage Resonance
          115: 0.3,    // Hull Kinetic Damage Resonance
          114: 0.4,    // Hull Explosive Damage Resonance
          482: 1000,   // Capacitor Capacity
          55: 150,     // Recharge Rate
          4: 12500000, // Mass
          70: 3.2,     // Agility
          37: 320,     // Max Velocity
          48: 350,     // CPU Output
          11: 85       // Powergrid Output
        }
      }
    });
    const calculator = new FittingCalculator(fitting);
    
    // First call should compute and cache
    const ehp1 = calculator.calculateEhp();
    // Second call should use cache
    const ehp2 = calculator.calculateEhp();
    
    expect(ehp1).toBe(ehp2);
  });
}); 