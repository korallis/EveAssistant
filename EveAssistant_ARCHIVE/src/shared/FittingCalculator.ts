import { ResistanceProfile } from './ResistanceProfile';
import { DamageProfile } from './DamageProfile';
import { Fitting as IFitting } from './domain';
import { IModule } from './types/domain.types';
import { Attributes } from './attributes';

export class FittingCalculator {
  private fitting: IFitting;
  private cache: Map<string, any> = new Map();
  private attributes = Attributes.getInstance();

  constructor(fitting: IFitting) {
    this.fitting = fitting;
  }

  public calculateEhp(damageProfile: DamageProfile = new DamageProfile(0.25, 0.25, 0.25, 0.25)): number {
    const cacheKey = `ehp-${JSON.stringify(damageProfile)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { ship, modules } = this.fitting;

    const shieldHp = ship.attributes[this.attributes.get('shieldCapacity') ?? 0] || 0;
    const armorHp = ship.attributes[this.attributes.get('armorHP') ?? 0] || 0;
    const hullHp = ship.attributes[this.attributes.get('hp') ?? 0] || 0;

    const shieldRes = new ResistanceProfile(
      ship.attributes[this.attributes.get('shieldEmDamageResonance') ?? 0] || 0,
      ship.attributes[this.attributes.get('shieldThermalDamageResonance') ?? 0] || 0,
      ship.attributes[this.attributes.get('shieldKineticDamageResonance') ?? 0] || 0,
      ship.attributes[this.attributes.get('shieldExplosiveDamageResonance') ?? 0] || 0
    );

    const armorRes = new ResistanceProfile(
      ship.attributes[this.attributes.get('armorEmDamageResonance') ?? 0] || 0,
      ship.attributes[this.attributes.get('armorThermalDamageResonance') ?? 0] || 0,
      ship.attributes[this.attributes.get('armorKineticDamageResonance') ?? 0] || 0,
      ship.attributes[this.attributes.get('armorExplosiveDamageResonance') ?? 0] || 0
    );

    const hullRes = new ResistanceProfile(
      ship.attributes[this.attributes.get('hullEmDamageResonance') ?? 0] || 0,
      ship.attributes[this.attributes.get('hullThermalDamageResonance') ?? 0] || 0,
      ship.attributes[this.attributes.get('hullKineticDamageResonance') ?? 0] || 0,
      ship.attributes[this.attributes.get('hullExplosiveDamageResonance') ?? 0] || 0
    );

    modules.forEach((module: IModule) => {
      shieldRes.em += module.attributes[this.attributes.get('shieldEmHardener') ?? 0] || 0; // Shield EM Hardener
      shieldRes.thermal += module.attributes[this.attributes.get('shieldThermalHardener') ?? 0] || 0; // Shield Thermal Hardener
      shieldRes.kinetic += module.attributes[this.attributes.get('shieldKineticHardener') ?? 0] || 0; // Shield Kinetic Hardener
      shieldRes.explosive += module.attributes[this.attributes.get('shieldExplosiveHardener') ?? 0] || 0; // Shield Explosive Hardener

      armorRes.em += module.attributes[this.attributes.get('armorEmHardener') ?? 0] || 0; // Armor EM Hardener
      armorRes.thermal += module.attributes[this.attributes.get('armorThermalHardener') ?? 0] || 0; // Armor Thermal Hardener
      armorRes.kinetic += module.attributes[this.attributes.get('armorKineticHardener') ?? 0] || 0; // Armor Kinetic Hardener
      armorRes.explosive += module.attributes[this.attributes.get('armorExplosiveHardener') ?? 0] || 0; // Armor Explosive Hardener
    });

    for (const module of modules) {
      for (const effectId in module.effects) {
        (window as any).dogma.traverseExpression(parseInt(effectId));
      }
    }

    // Calculate EHP for each layer
    const shieldEhp = shieldHp / (1 - Math.min(shieldRes.em, 1)); // Simplified EHP calc
    const armorEhp = armorHp / (1 - Math.min(armorRes.em, 1)); // Simplified EHP calc
    const hullEhp = hullHp / (1 - Math.min(hullRes.em, 1)); // Simplified EHP calc

    const result = shieldEhp + armorEhp + hullEhp;
    this.cache.set(cacheKey, result);
    return result;
  }

  public calculateCapacitor(): { peakRecharge: number, stable: boolean } {
    const cacheKey = 'capacitor';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { ship, modules } = this.fitting;

    const capCapacity = ship.attributes[this.attributes.get('capacitorCapacity') ?? 0] || 0;
    const capRechargeTime = ship.attributes[this.attributes.get('rechargeRate') ?? 0] || 0;

    let totalCapUsage = 0;
    modules.forEach((module: IModule) => {
      totalCapUsage += module.attributes[this.attributes.get('capacitorNeed') ?? 0] || 0;
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

    const usage = this.fitting.modules.reduce((acc, module) => acc + (module.cpu || 0), 0);
    const output = this.fitting.ship.attributes[this.attributes.get('cpuOutput') ?? 0] || 0;
    const result = { usage, output };

    this.cache.set(cacheKey, result);
    return result;
  }

  public calculatePowergrid(): { usage: number, output: number } {
    const cacheKey = `powergrid`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const usage = this.fitting.modules.reduce((acc, module) => acc + (module.powergrid || 0), 0);
    const output = this.fitting.ship.attributes[this.attributes.get('powergridOutput') ?? 0] || 0;
    const result = { usage, output };

    this.cache.set(cacheKey, result);
    return result;
  }

  public calculateDps(_damageProfile: DamageProfile = new DamageProfile(0.25, 0.25, 0.25, 0.25)): number {
    const cacheKey = `dps-${JSON.stringify(_damageProfile)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { ship: _ship, modules: _modules } = this.fitting;

    let totalDps = 0;

    // TODO: Implement turret, missile, and drone DPS calculations

    const result = totalDps;
    this.cache.set(cacheKey, result);
    return result;
  }

  public calculateSpeedAndAgility(): { maxVelocity: number, agility: number, alignTime: number } {
    const cacheKey = `speed`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { ship } = this.fitting;

    const mass = ship.attributes[this.attributes.get('mass') ?? 0] || 0;
    const agility = ship.attributes[this.attributes.get('agility') ?? 0] || 0;
    const maxVelocity = ship.attributes[this.attributes.get('maxVelocity') ?? 0] || 0;

    /*
    modules.forEach((module: IModule) => {
      // TODO: Apply module effects to speed and agility
    });
    */

    const alignTime = -Math.log(0.25) * (mass * agility) / 1000000;
    const result = { maxVelocity, agility, alignTime };

    this.cache.set(cacheKey, result);
    return result;
  }

  /*
  private _applyStackingPenalties(_effects: number[]): number {
    return 0;
  }

  private _getSkillBonus(_attributeId: number): number {
    return 0;
  }

  private _getBonus(_attributeId: number): number {
    return 0;
  }

  private _calculateFittingStats(): { cpu: { usage: number, output: number }, pg: { usage: number, output: number } } {
    const { ship, modules } = this.fitting;

    const shipCpu = ship.attributes[this.attributes.get('cpuOutput') ?? 0] || 0;
    const shipPg = ship.attributes[this.attributes.get('powergridOutput') ?? 0] || 0;

    let totalCpuUsage = 0;
    let totalPgUsage = 0;

    modules.forEach((module: IModule) => {
      totalCpuUsage += module.attributes[this.attributes.get('cpuUsage') ?? 0] || 0;
      totalPgUsage += module.attributes[this.attributes.get('powergridUsage') ?? 0] || 0;
    });

    return {
      cpu: { usage: totalCpuUsage / shipCpu, output: shipCpu },
      pg: { usage: totalPgUsage / shipPg, output: shipPg }
    };
  }
  */
} 