import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('market_groups')
export class MarketGroup {
  @PrimaryColumn()
  marketGroupID: number;

  @Column()
  marketGroupName: string;

  @Column({ nullable: true })
  parentGroupID?: number;
} 