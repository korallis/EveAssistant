import { Fitting } from './domain';
import { ResistanceProfile, DamageProfile } from './types/value-objects';
import { Attributes } from './Attributes';

export class FittingCalculator {
  private fitting: Fitting;
  private cache: Map<string, any> = new Map();
  private attributes = Attributes.getInstance();

  constructor(fitting: Fitting) {
    this.fitting = fitting;
  }

  public calculateEhp(damageProfile: DamageProfile = new DamageProfile(0.25, 0.25, 0.25, 0.25)): number {
    const cacheKey = `ehp-${JSON.stringify(damageProfile)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { ship, modules } = this.fitting;

    // Base HP
    const shieldHp = ship.attributes[this.attributes.get('shieldCapacity')] || 0;
    const armorHp = ship.attributes[this.attributes.get('armorHP')] || 0;
    const hullHp = ship.attributes[this.attributes.get('hp')] || 0;

    // Base resistances
    const shieldRes = new ResistanceProfile(
      ship.attributes[this.attributes.get('shieldEmDamageResonance')] || 0,
      ship.attributes[this.attributes.get('shieldThermalDamageResonance')] || 0,
      ship.attributes[this.attributes.get('shieldKineticDamageResonance')] || 0,
      ship.attributes[this.attributes.get('shieldExplosiveDamageResonance')] || 0
    );

    const armorRes = new ResistanceProfile(
      ship.attributes[this.attributes.get('armorEmDamageResonance')] || 0,
      ship.attributes[this.attributes.get('armorThermalDamageResonance')] || 0,
      ship.attributes[this.attributes.get('armorKineticDamageResonance')] || 0,
      ship.attributes[this.attributes.get('armorExplosiveDamageResonance')] || 0
    );

    const hullRes = new ResistanceProfile(
      ship.attributes[this.attributes.get('hullEmDamageResonance')] || 0,
      ship.attributes[this.attributes.get('hullThermalDamageResonance')] || 0,
      ship.attributes[this.attributes.get('hullKineticDamageResonance')] || 0,
      ship.attributes[this.attributes.get('hullExplosiveDamageResonance')] || 0
    );

    // Apply module and skill effects to resistances
    modules.forEach(module => {
      // TODO: Replace with actual attribute IDs for module resistance bonuses
      shieldRes.em += module.attributes[this.attributes.get('shieldEmHardener')] || 0; // Shield EM Hardener
      shieldRes.thermal += module.attributes[this.attributes.get('shieldThermalHardener')] || 0; // Shield Thermal Hardener
      shieldRes.kinetic += module.attributes[this.attributes.get('shieldKineticHardener')] || 0; // Shield Kinetic Hardener
      shieldRes.explosive += module.attributes[this.attributes.get('shieldExplosiveHardener')] || 0; // Shield Explosive Hardener

      armorRes.em += module.attributes[this.attributes.get('armorEmHardener')] || 0; // Armor EM Hardener
      armorRes.thermal += module.attributes[this.attributes.get('armorThermalHardener')] || 0; // Armor Thermal Hardener
      armorRes.kinetic += module.attributes[this.attributes.get('armorKineticHardener')] || 0; // Armor Kinetic Hardener
      armorRes.explosive += module.attributes[this.attributes.get('armorExplosiveHardener')] || 0; // Armor Explosive Hardener
    });

    // Apply module and skill effects to resistances
    this.applyModuleEffects();

    // Calculate EHP for each layer
    const shieldEhp = shieldHp / (1 - Math.min(shieldRes.em, 1)); // Simplified EHP calc
    const armorEhp = armorHp / (1 - Math.min(armorRes.em, 1)); // Simplified EHP calc
    const hullEhp = hullHp / (1 - Math.min(hullRes.em, 1)); // Simplified EHP calc

    const result = shieldEhp + armorEhp + hullEhp;
    this.cache.set(cacheKey, result);
    return result;
  }

  private applyModuleEffects(): void {
    const { modules } = this.fitting;
    modules.forEach(module => {
      for (const effectId in module.effects) {
        window.dogma.traverseExpression(parseInt(effectId));
      }
    });
  }

  public calculateCapacitor(): { peakRecharge: number, stable: boolean } {
    const cacheKey = 'capacitor';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { ship, modules } = this.fitting;

    const capCapacity = ship.attributes[this.attributes.get('capacitorCapacity')] || 0;
    const capRechargeTime = ship.attributes[this.attributes.get('rechargeRate')] || 0;

    // Apply module and skill effects to capacitor
    let totalCapUsage = 0;
    modules.forEach(module => {
      // TODO: Replace with actual attribute IDs for module capacitor bonuses
      // Note: These are just examples, actual attributes will differ
      // capCapacity += module.attributes[this.attributes.get('capacitorBonus')] || 0;
      // capRechargeTime *= (1 - (module.attributes[this.attributes.get('rechargeRateBonus')] || 0));

      totalCapUsage += module.attributes[this.attributes.get('capacitorNeed')] || 0;
    });

    // TODO: Apply skill effects to capacitor

    const peakRecharge = (10 * capCapacity) / capRechargeTime;

    const stable = peakRecharge >= totalCapUsage;

    const result = { peakRecharge, stable };
    this.cache.set(cacheKey, result);
    return result;
  }

  public calculateCpu(): { usage: number, output: number } {
    const cacheKey = `cpu`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const usage = this.fitting.modules.reduce((acc, module) => acc + module.cpu, 0);
    const output = this.fitting.ship.attributes[this.attributes.get('cpuOutput')] || 0;
    const result = { usage, output };

    this.cache.set(cacheKey, result);
    return result;
  }

  public calculatePowergrid(): { usage: number, output: number } {
    const cacheKey = `powergrid`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const usage = this.fitting.modules.reduce((acc, module) => acc + module.powergrid, 0);
    const output = this.fitting.ship.attributes[this.attributes.get('powergridOutput')] || 0;
    const result = { usage, output };

    this.cache.set(cacheKey, result);
    return result;
  }

  public calculateDps(damageProfile: DamageProfile = new DamageProfile(0.25, 0.25, 0.25, 0.25)): number {
    const cacheKey = `dps-${JSON.stringify(damageProfile)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { ship, modules } = this.fitting;

    let totalDps = 0;

    // TODO: Implement turret, missile, and drone DPS calculations

    const result = totalDps;
    this.cache.set(cacheKey, result);
    return result;
  }

  public calculateSpeedAndAgility(): { maxVelocity: number, alignTime: number } {
    const cacheKey = 'speedAndAgility';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { ship, modules } = this.fitting;

    let mass = ship.attributes[this.attributes.get('mass')] || 0;
    let agility = ship.attributes[this.attributes.get('agility')] || 0;
    let maxVelocity = ship.attributes[this.attributes.get('maxVelocity')] || 0;

    // Apply module and skill effects to mass, agility, and maxVelocity
    modules.forEach(module => {
      // TODO: Replace with actual attribute IDs for module speed/agility bonuses
      // mass *= (1 + (module.attributes[this.attributes.get('massMultiplier')] || 0));
      // agility *= (1 - (module.attributes[this.attributes.get('agilityMultiplier')] || 0));
      // maxVelocity *= (1 + (module.attributes[this.attributes.get('velocityMultiplier')] || 0));
    });

    // TODO: Apply skill effects to mass, agility, and maxVelocity

    const alignTime = -Math.log(0.25) * (mass * agility) / 1000000;

    const result = { maxVelocity, alignTime };
    this.cache.set(cacheKey, result);
    return result;
  }

  private applyStackingPenalties(effects: number[]): number {
    effects.sort((a, b) => b - a);
    let totalEffect = 1;
    effects.forEach((effect, index) => {
      totalEffect *= (1 - effect * Math.pow(0.5, Math.pow(index / 2.22292081, 2)));
    });
    return 1 - totalEffect;
  }

  private getSkillBonus(attributeId: number): number {
    // TODO: Implement actual skill bonus logic
    return 1; // For now, no bonus
  }

  private getBonus(attributeId: number): number {
    // TODO: Implement actual module effect handling logic
    return 1; // For now, no bonus
  }

  public calculateFitting(): { cpuUsage: number, pgUsage: number } {
    const cacheKey = 'fitting';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { ship, modules } = this.fitting;

    const shipCpu = ship.attributes[this.attributes.get('cpuOutput')] || 0;
    const shipPg = ship.attributes[this.attributes.get('powergridOutput')] || 0;

    let totalCpuUsage = 0;
    let totalPgUsage = 0;

    modules.forEach(module => {
      totalCpuUsage += module.attributes[this.attributes.get('cpuUsage')] || 0;
      totalPgUsage += module.attributes[this.attributes.get('powergridUsage')] || 0;
    });

    // TODO: Apply module and skill effects to CPU and PG

    const result = { cpuUsage: totalCpuUsage / shipCpu, pgUsage: totalPgUsage / shipPg };
    this.cache.set(cacheKey, result);
    return result;
  }
} 