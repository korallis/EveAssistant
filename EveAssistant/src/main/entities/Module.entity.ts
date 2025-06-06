import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('modules')
export class Module {
  @PrimaryColumn()
  typeID: number;

  @Column()
  typeName: string;

  @Column('simple-json')
  effects: Record<string, any>;

  @Column('simple-json')
  requirements: Record<string, any>;
} 