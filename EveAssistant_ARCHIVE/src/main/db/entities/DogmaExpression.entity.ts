import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'dgmExpressions' })
export class DogmaExpression {
  @PrimaryColumn()
  expressionID: number;

  @Column({ nullable: true })
  operandID: number;

  @Column({ nullable: true })
  arg1: number;

  @Column({ nullable: true })
  arg2: number;

  @Column({ nullable: true })
  expressionValue: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  expressionName: string;

  @Column({ nullable: true })
  expressionTypeID: number;

  @Column({ nullable: true })
  expressionGroupID: number;

  @Column({ nullable: true })
  expressionAttributeID: number;
} 