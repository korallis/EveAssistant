import { Fitting } from './domain';
import { ResistanceProfile, DamageProfile } from './types/value-objects';

export class FittingCalculator {
  private fitting: Fitting;
  private cache: Map<string, any> = new Map();

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
    const shieldHp = ship.attributes[265] || 0; // shieldCapacity
    const armorHp = ship.attributes[263] || 0; // armorHP
    const hullHp = ship.attributes[9] || 0; // hp

    // Base resistances
    const shieldRes = new ResistanceProfile(
      ship.attributes[267] || 0, // shieldEmDamageResonance
      ship.attributes[268] || 0, // shieldThermalDamageResonance
      ship.attributes[269] || 0, // shieldKineticDamageResonance
      ship.attributes[270] || 0 // shieldExplosiveDamageResonance
    );

    const armorRes = new ResistanceProfile(
      ship.attributes[264] || 0, // armorEmDamageResonance
      ship.attributes[265] || 0, // armorThermalDamageResonance
      ship.attributes[266] || 0, // armorKineticDamageResonance
      ship.attributes[267] || 0 // armorExplosiveDamageResonance
    );

    const hullRes = new ResistanceProfile(
      ship.attributes[9] || 0, // hullEmDamageResonance
      ship.attributes[9] || 0, // hullThermalDamageResonance
      ship.attributes[9] || 0, // hullKineticDamageResonance
      ship.attributes[9] || 0 // hullExplosiveDamageResonance
    );

    // TODO: Apply module and skill effects to resistances

    const shieldEffectiveHp = shieldHp / (1 - (shieldRes.em * damageProfile.em + shieldRes.thermal * damageProfile.thermal + shieldRes.kinetic * damageProfile.kinetic + shieldRes.explosive * damageProfile.explosive));
    const armorEffectiveHp = armorHp / (1 - (armorRes.em * damageProfile.em + armorRes.thermal * damageProfile.thermal + armorRes.kinetic * damageProfile.kinetic + armorRes.explosive * damageProfile.explosive));
    const hullEffectiveHp = hullHp / (1 - (hullRes.em * damageProfile.em + hullRes.thermal * damageProfile.thermal + hullRes.kinetic * damageProfile.kinetic + hullRes.explosive * damageProfile.explosive));

    const result = shieldEffectiveHp + armorEffectiveHp + hullEffectiveHp;
    this.cache.set(cacheKey, result);
    return result;
  }

  public calculateCapacitor(): { peakRecharge: number, stable: boolean } {
    const cacheKey = 'capacitor';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { ship, modules } = this.fitting;

    const capCapacity = ship.attributes[50] || 0; // capacitorCapacity
    const capRechargeTime = ship.attributes[55] || 0; // rechargeRate

    // TODO: Apply module and skill effects to capacitor

    const peakRecharge = (10 * capCapacity) / capRechargeTime;

    // TODO: Calculate total capacitor usage from modules
    const capUsage = 0;

    const stable = peakRecharge >= capUsage;

    const result = { peakRecharge, stable };
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

    const mass = ship.attributes[28] || 0; // mass
    const agility = ship.attributes[70] || 0; // agility
    const maxVelocity = ship.attributes[37] || 0; // maxVelocity

    // TODO: Apply module and skill effects to mass, agility, and maxVelocity

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

    const shipCpu = ship.attributes[48] || 0; // cpuOutput
    const shipPg = ship.attributes[11] || 0; // powergridOutput

    let totalCpuUsage = 0;
    let totalPgUsage = 0;

    modules.forEach(module => {
      totalCpuUsage += module.attributes[50] || 0; // cpuUsage
      totalPgUsage += module.attributes[30] || 0; // powergridUsage
    });

    // TODO: Apply module and skill effects to CPU and PG

    const result = { cpuUsage: totalCpuUsage / shipCpu, pgUsage: totalPgUsage / shipPg };
    this.cache.set(cacheKey, result);
    return result;
  }
} 