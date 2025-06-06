export interface DamageProfile {
  em: number;
  thermal: number;
  kinetic: number;
  explosive: number;
}

export interface TurretWeapon {
  damageProfile: DamageProfile;
  rateOfFire: number; // shots per second
  numberOfTurrets: number;
}

export interface DamageModifier {
  em?: number;
  thermal?: number;
  kinetic?: number;
  explosive?: number;
  rateOfFire?: number;
}

export class DpsService {
  /**
   * Calculates the base DPS.
   * @param damagePerShot - The damage dealt by a single shot.
   * @param shotsPerSecond - The number of shots fired per second (rate of fire).
   * @returns The calculated Damage Per Second (DPS).
   */
  public calculateBaseDps(damagePerShot: number, shotsPerSecond: number): number {
    if (damagePerShot < 0 || shotsPerSecond < 0) {
      return 0;
    }
    return damagePerShot * shotsPerSecond;
  }

  /**
   * Calculates the DPS for a bank of turrets.
   * @param weapon - The turret weapon configuration.
   * @returns The total DPS for all turrets.
   */
  public calculateTurretDps(weapon: TurretWeapon, modifiers: DamageModifier[] = []): number {
    const totalDamagePerShot = Object.values(weapon.damageProfile).reduce((sum, damage) => sum + damage, 0);
    const modifiedDamage = this.applyDamageModifiers(totalDamagePerShot, modifiers);

    const modifiedRateOfFire = this.applyRateOfFireModifiers(weapon.rateOfFire, modifiers);

    const dpsPerTurret = this.calculateBaseDps(modifiedDamage, modifiedRateOfFire);
    return dpsPerTurret * weapon.numberOfTurrets;
  }

  private applyDamageModifiers(baseDamage: number, modifiers: DamageModifier[]): number {
    let modifiedDamage = baseDamage;
    // This is a simplified example. A real implementation would be more complex.
    for (const modifier of modifiers) {
      if (modifier.em) modifiedDamage *= modifier.em;
      if (modifier.thermal) modifiedDamage *= modifier.thermal;
      if (modifier.kinetic) modifiedDamage *= modifier.kinetic;
      if (modifier.explosive) modifiedDamage *= modifier.explosive;
    }
    return modifiedDamage;
  }

  private applyRateOfFireModifiers(baseRateOfFire: number, modifiers: DamageModifier[]): number {
    let modifiedRateOfFire = baseRateOfFire;
    for (const modifier of modifiers) {
      if (modifier.rateOfFire) modifiedRateOfFire *= modifier.rateOfFire;
    }
    return modifiedRateOfFire;
  }

  /**
   * Compares two turret setups and returns the one with the higher DPS.
   * @param setupA - The first weapon setup.
   * @param setupB - The second weapon setup.
   * @returns The setup with the higher DPS.
   */
  public compareTurretSetups(
    setupA: { weapon: TurretWeapon; modifiers: DamageModifier[] },
    setupB: { weapon: TurretWeapon; modifiers: DamageModifier[] }
  ): { weapon: TurretWeapon; modifiers: DamageModifier[] } {
    const dpsA = this.calculateTurretDps(setupA.weapon, setupA.modifiers);
    const dpsB = this.calculateTurretDps(setupB.weapon, setupB.modifiers);

    return dpsA >= dpsB ? setupA : setupB;
  }
} 