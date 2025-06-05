export class DamageProfile {
  readonly em: number;
  readonly thermal: number;
  readonly kinetic: number;
  readonly explosive: number;

  constructor(em: number, thermal: number, kinetic: number, explosive: number) {
    this.em = em;
    this.thermal = thermal;
    this.kinetic = kinetic;
    this.explosive = explosive;
  }
}

export class ResistanceProfile {
  readonly em: number;
  readonly thermal: number;
  readonly kinetic: number;
  readonly explosive: number;

  constructor(em: number, thermal: number, kinetic: number, explosive: number) {
    this.em = em;
    this.thermal = thermal;
    this.kinetic = kinetic;
    this.explosive = explosive;
  }
} 