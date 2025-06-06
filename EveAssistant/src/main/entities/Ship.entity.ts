import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

@Entity('ships')
export class Ship {
  @PrimaryColumn()
  typeID: number;

  @Column()
  typeName: string;

  @Index()
  @Column()
  groupID: number;

  @Column('simple-json')
  attributes: Record<string, any>;
} 