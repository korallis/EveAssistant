export class Attributes {
  private static instance: Attributes;
  private attributes: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): Attributes {
    if (!Attributes.instance) {
      Attributes.instance = new Attributes();
    }
    return Attributes.instance;
  }

  public setAttributes(attributes: Map<string, number>): void {
    this.attributes = attributes;
  }

  public get(name: string): number | undefined {
    return this.attributes.get(name);
  }
}

export const attributeNames = [
  'shieldCapacity',
  'armorHP',
  'hp',
  'shieldEmDamageResonance',
  'shieldThermalDamageResonance',
  'shieldKineticDamageResonance',
  'shieldExplosiveDamageResonance',
  'armorEmDamageResonance',
  'armorThermalDamageResonance',
  'armorKineticDamageResonance',
  'armorExplosiveDamageResonance',
  'hullEmDamageResonance',
  'hullThermalDamageResonance',
  'hullKineticDamageResonance',
  'hullExplosiveDamageResonance',
  'capacitorCapacity',
  'rechargeRate',
  'capacitorNeed',
  'mass',
  'agility',
  'maxVelocity',
  'cpuOutput',
  'powergridOutput',
  'cpuUsage',
  'powergridUsage',
  // Add other attribute names here
]; 