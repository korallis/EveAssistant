import { DataSource } from 'typeorm';
import { Ship } from './entities/Ship.entity';
import { Module } from './entities/Module.entity';
import { Skill } from './entities/Skill.entity';
import { MarketGroup } from './entities/MarketGroup.entity';
import path from 'path';

// This function dynamically imports electron.app
const getDbPath = () => {
  try {
    // This will only work in an Electron environment
    const { app } = require('electron');
    return path.join(app.getPath('userData'), 'eve-assistant.sqlite');
  } catch (error) {
    // This will be used by the TypeORM CLI
    return path.join(__dirname, '..', '..', 'eve-assistant.sqlite');
  }
};

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: getDbPath(),
  synchronize: false,
  logging: false, // Disable logging for CLI
  entities: [Ship, Module, Skill, MarketGroup],
  migrations: [path.join(__dirname, 'migrations', '**', '*.ts')],
  subscribers: [],
}); 