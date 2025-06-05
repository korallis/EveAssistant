import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'dgmTypeEffects' })
export class DogmaTypeEffect {
  @PrimaryColumn()
  typeID: number;

  @PrimaryColumn()
  effectID: number;
} 