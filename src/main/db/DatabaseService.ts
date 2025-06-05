import { DataSource, Repository } from 'typeorm';
import { Ship } from './entities/Ship.entity';
import { Module } from './entities/Module.entity';
import { Skill } from './entities/Skill.entity';
import { MarketGroup } from './entities/MarketGroup.entity';
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
  }

  public getDataSource(): DataSource {
    return this.dataSource;
  }
} 