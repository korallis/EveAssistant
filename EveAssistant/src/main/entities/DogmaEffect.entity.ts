import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'dgmEffects' })
export class DogmaEffect {
  @PrimaryColumn()
  effectID: number;

  @Column()
  effectName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  preExpression: number;

  @Column({ nullable: true })
  postExpression: number;
} 