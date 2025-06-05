import { DamageModifier } from './dps.service';

export class SkillService {
  /**
   * Gets the skill-based damage modifiers for the current character.
   * This is a placeholder and would be much more complex in a real app.
   * @returns An array of DamageModifier objects representing skill bonuses.
   */
  public getSkillModifiers(): DamageModifier[] {
    // Example: 5% bonus to rate of fire from a skill
    const rateOfFireBonus: DamageModifier = {
      rateOfFire: 1.05,
    };

    // Example: 10% bonus to EM damage
    const emDamageBonus: DamageModifier = {
      em: 1.10,
    };

    return [rateOfFireBonus, emDamageBonus];
  }
} 