import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'dgmAttributeTypes' })
export class DogmaAttribute {
  @PrimaryColumn()
  attributeID: number;

  @Column()
  attributeName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  unitID: number;

  @Column({ nullable: true })
  stackable: boolean;

  @Column({ nullable: true })
  highIsGood: boolean;
} 