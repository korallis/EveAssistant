import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CommonFit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  shipId: number;

  @Column('simple-json')
  modules: { typeId: number, slot: string }[];

  @Column()
  activityProfileId: string;
} 