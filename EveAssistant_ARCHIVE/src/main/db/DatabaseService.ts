import { DataSource, Repository } from 'typeorm';
import { Ship } from './entities/Ship.entity';
import { Module } from './entities/Module.entity';
import { Skill } from './entities/Skill.entity';
import { MarketGroup } from './entities/MarketGroup.entity';
import { DogmaAttribute } from './entities/DogmaAttribute.entity';
import { DogmaEffect } from './entities/DogmaEffect.entity';
import { DogmaTypeEffect } from './entities/DogmaTypeEffect.entity';
import { DogmaExpression } from './entities/DogmaExpression.entity';
import { AppDataSource } from './dataSource';
import path from 'path';
import { app } from 'electron';

export class DatabaseService {
  private static instance: DatabaseService;
  private dataSource: DataSource;

  public shipRepository: Repository<Ship>;
  public moduleRepository: Repository<Module>;
  public skillRepository: Repository<Skill>;
  public marketGroupRepository: Repository<MarketGroup>;
  public dogmaAttributeRepository: Repository<DogmaAttribute>;
  public dogmaEffectRepository: Repository<DogmaEffect>;
  public dogmaTypeEffectRepository: Repository<DogmaTypeEffect>;
  public dogmaExpressionRepository: Repository<DogmaExpression>;

  private constructor() {
    this.dataSource = AppDataSource;
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
      console.log('Database connection initialized');
    }
    this.shipRepository = this.dataSource.getRepository(Ship);
    this.moduleRepository = this.dataSource.getRepository(Module);
    this.skillRepository = this.dataSource.getRepository(Skill);
    this.marketGroupRepository = this.dataSource.getRepository(MarketGroup);
    this.dogmaAttributeRepository = this.dataSource.getRepository(DogmaAttribute);
    this.dogmaEffectRepository = this.dataSource.getRepository(DogmaEffect);
    this.dogmaTypeEffectRepository = this.dataSource.getRepository(DogmaTypeEffect);
    this.dogmaExpressionRepository = this.dataSource.getRepository(DogmaExpression);
  }

  public getDataSource(): DataSource {
    return this.dataSource;
  }

  public async findDogmaAttributeByName(name: string): Promise<DogmaAttribute | undefined> {
    return this.dogmaAttributeRepository.findOne({ where: { attributeName: name } });
  }

  public async getShip(typeId: number): Promise<IShip> {
    return await this.shipRepository.findOne({ where: { typeID: typeId } });
  }

  public async getModules(): Promise<IModule[]> {
    return await this.moduleRepository.find();
  }
} 