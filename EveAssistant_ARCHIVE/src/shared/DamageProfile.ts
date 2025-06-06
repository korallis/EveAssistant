export class DamageProfile {
  em: number;
  thermal: number;
  kinetic: number;
  explosive: number;

  constructor(em: number, thermal: number, kinetic: number, explosive: number) {
    this.em = em;
    this.thermal = thermal;
    this.kinetic = kinetic;
    this.explosive = explosive;
  }
} 