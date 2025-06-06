import { Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'dgmTypeEffects' })
export class DogmaTypeEffect {
  @PrimaryColumn()
  typeID: number;

  @PrimaryColumn()
  effectID: number;
} 