import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Ship } from './entities/Ship.entity';
import { Module } from './entities/Module.entity';
import { Skill } from './entities/Skill.entity';
import { MarketGroup } from './entities/MarketGroup.entity';
import { DogmaAttribute } from './entities/DogmaAttribute.entity';
import { DogmaEffect } from './entities/DogmaEffect.entity';
import { DogmaTypeEffect } from './entities/DogmaTypeEffect.entity';
import { DogmaExpression } from './entities/DogmaExpression.entity';
import { InitialMigration1749157364409 as InitialMigration } from './migrations/1749157364409-InitialMigration';
import { AddShipGroupIndex1749157398870 as AddShipGroupIndex } from './migrations/1749157398870-AddShipGroupIndex';
import { CommonFit } from './entities/CommonFit.entity';
import { Task } from './entities/Task.entity';
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
  entities: [Ship, Module, Skill, MarketGroup, DogmaAttribute, DogmaEffect, DogmaTypeEffect, DogmaExpression, CommonFit, Task],
  migrations: [InitialMigration, AddShipGroupIndex],
  subscribers: [],
}); 