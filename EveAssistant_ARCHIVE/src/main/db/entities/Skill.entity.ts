import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryColumn()
  typeID: number;

  @Column()
  typeName: string;
} 