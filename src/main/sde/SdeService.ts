import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { app, BrowserWindow } from 'electron';
import AdmZip from 'adm-zip';
import yaml from 'js-yaml';
import { DatabaseService } from '../db/DatabaseService';
import crypto from 'crypto';

export class SdeService {
  private readonly SDE_BASE_URL = 'https://eve-static-data-export.s3-eu-west-1.amazonaws.com/tranquility/';
  private readonly SDE_ZIP_URL = `${this.SDE_BASE_URL}sde.zip`;
  private readonly SDE_MD5_URL = `${this.SDE_BASE_URL}sde.zip.md5`;
  private readonly sdePath = path.join(app.getPath('userData'), 'sde');
  private readonly zipPath = path.join(this.sdePath, 'sde.zip');
  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  private sendProgress(status: string, progress?: number): void {
    this.mainWindow.webContents.send('sde-progress', { status, progress });
  }

  public async downloadSde(): Promise<void> {
    const dbService = DatabaseService.getInstance();
    const shipCount = await dbService.shipRepository.count();

    if (shipCount > 0) {
      console.log('SDE data already exists. Skipping download and import.');
      return;
    }

    try {
      this.sendProgress('downloading', 0);
      console.log('Starting SDE download...');
      await fs.ensureDir(this.sdePath);

      const response = await axios({
        method: 'get',
        url: this.SDE_ZIP_URL,
        responseType: 'stream',
      });

      const totalLength = parseInt(response.headers['content-length'], 10);
      let downloadedLength = 0;

      const writer = fs.createWriteStream(this.zipPath);
      response.data.on('data', (chunk) => {
        downloadedLength += chunk.length;
        const progress = (downloadedLength / totalLength) * 100;
        this.sendProgress('downloading', progress);
      });
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      this.sendProgress('verifying');
      console.log('SDE download complete. Verifying checksum...');
      const checksumVerified = await this.verifyChecksum();
      if (!checksumVerified) {
        throw new Error('SDE checksum verification failed.');
      }

      this.sendProgress('extracting');
      console.log('Checksum verified. Extracting...');
      const zip = new AdmZip(this.zipPath);
      zip.extractAllTo(this.sdePath, true);
      console.log('SDE extraction complete.');

      // Clean up the zip file
      await fs.remove(this.zipPath);

      await this.importTypeIDs();
      await this.importDogmaAttributes();
      await this.importDogmaEffects();
      await this.importDogmaTypeEffects();
      await this.importDogmaExpressions();

    } catch (error) {
      console.error('Error downloading or extracting SDE:', error);
      throw error;
    }
  }

  private async verifyChecksum(): Promise<boolean> {
    try {
      // Download the MD5 checksum file
      const md5Response = await axios.get(this.SDE_MD5_URL);
      const expectedChecksum = md5Response.data.trim();

      // Calculate the checksum of the downloaded zip file
      const fileBuffer = await fs.readFile(this.zipPath);
      const hashSum = crypto.createHash('md5');
      hashSum.update(fileBuffer);
      const actualChecksum = hashSum.digest('hex');

      console.log(`Expected checksum: ${expectedChecksum}`);
      console.log(`Actual checksum:   ${actualChecksum}`);

      return expectedChecksum === actualChecksum;
    } catch (error) {
      console.error('Error verifying checksum:', error);
      return false;
    }
  }

  public async importTypeIDs(): Promise<void> {
    try {
      this.sendProgress('importing');
      console.log('Starting typeID import...');
      const typeIDsPath = path.join(this.sdePath, 'sde', 'fsd', 'typeIDs.yaml');
      const typeIDsCachePath = path.join(this.sdePath, 'typeIDs.json');
      let typeIDs: Record<string, any>;

      if (await fs.pathExists(typeIDsCachePath)) {
        console.log('Loading typeIDs from cache...');
        typeIDs = await fs.readJson(typeIDsCachePath);
      } else {
        console.log('Parsing typeIDs.yaml...');
        const fileContents = await fs.readFile(typeIDsPath, 'utf8');
        typeIDs = yaml.load(fileContents) as Record<string, any>;
        await fs.writeJson(typeIDsCachePath, typeIDs);
        console.log('Saved typeIDs to cache.');
      }

      const dbService = DatabaseService.getInstance();
      const shipsToInsert = [];

      for (const id in typeIDs) {
        const typeData = typeIDs[id];

        // Basic data validation
        if (!typeData.name?.en || !typeData.groupID) {
          console.warn(`Skipping typeID ${id} due to missing data.`);
          continue;
        }

        // For now, we'll just insert everything into the ships table
        shipsToInsert.push({
          typeID: parseInt(id),
          typeName: typeData.name.en,
          groupID: typeData.groupID,
          attributes: typeData.dogmaAttributes || {},
          effects: typeData.dogmaEffects || {},
          cpu: typeData.dogmaAttributes?.find(a => a.attributeID === 50)?.value || 0,
          powergrid: typeData.dogmaAttributes?.find(a => a.attributeID === 30)?.value || 0,
        });
      }

      // Use a transaction to insert all ships at once
      await dbService.getDataSource().transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.getRepository('Ship').save(shipsToInsert);
      });

      console.log(`Imported ${shipsToInsert.length} typeIDs.`);

    } catch (error) {
      console.error('Error importing typeIDs:', error);
      throw error;
    }
  }

  private async importDogmaAttributes(): Promise<void> {
    try {
      this.sendProgress('importing_dogma');
      console.log('Starting Dogma attribute import...');
      const dogmaAttributesPath = path.join(this.sdePath, 'sde', 'fsd', 'dogma_attributes.yaml');
      const dogmaAttributesCachePath = path.join(this.sdePath, 'dogma_attributes.json');
      let dogmaAttributes: Record<string, any>;

      if (await fs.pathExists(dogmaAttributesCachePath)) {
        console.log('Loading Dogma attributes from cache...');
        dogmaAttributes = await fs.readJson(dogmaAttributesCachePath);
      } else {
        console.log('Parsing dogma_attributes.yaml...');
        const fileContents = await fs.readFile(dogmaAttributesPath, 'utf8');
        dogmaAttributes = yaml.load(fileContents) as Record<string, any>;
        await fs.writeJson(dogmaAttributesCachePath, dogmaAttributes);
        console.log('Saved Dogma attributes to cache.');
      }

      const dbService = DatabaseService.getInstance();
      const attributesToInsert = [];

      for (const id in dogmaAttributes) {
        const attributeData = dogmaAttributes[id];
        attributesToInsert.push({
          attributeID: attributeData.attributeID,
          attributeName: attributeData.name,
          description: attributeData.description,
          displayName: attributeData.displayName,
          unitID: attributeData.unitID,
          stackable: attributeData.stackable,
          highIsGood: attributeData.highIsGood,
        });
      }

      await dbService.getDataSource().transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.getRepository('DogmaAttribute').save(attributesToInsert);
      });

      console.log(`Imported ${attributesToInsert.length} Dogma attributes.`);

    } catch (error) {
      console.error('Error importing Dogma attributes:', error);
      throw error;
    }
  }

  private async importDogmaEffects(): Promise<void> {
    try {
      this.sendProgress('importing_dogma_effects');
      console.log('Starting Dogma effect import...');
      const dogmaEffectsPath = path.join(this.sdePath, 'sde', 'fsd', 'dogma_effects.yaml');
      const dogmaEffectsCachePath = path.join(this.sdePath, 'dogma_effects.json');
      let dogmaEffects: Record<string, any>;

      if (await fs.pathExists(dogmaEffectsCachePath)) {
        console.log('Loading Dogma effects from cache...');
        dogmaEffects = await fs.readJson(dogmaEffectsCachePath);
      } else {
        console.log('Parsing dogma_effects.yaml...');
        const fileContents = await fs.readFile(dogmaEffectsPath, 'utf8');
        dogmaEffects = yaml.load(fileContents) as Record<string, any>;
        await fs.writeJson(dogmaEffectsCachePath, dogmaEffects);
        console.log('Saved Dogma effects to cache.');
      }

      const dbService = DatabaseService.getInstance();
      const effectsToInsert = [];

      for (const id in dogmaEffects) {
        const effectData = dogmaEffects[id];
        effectsToInsert.push({
          effectID: effectData.effectID,
          effectName: effectData.name,
          description: effectData.description,
          displayName: effectData.displayName,
          preExpression: effectData.preExpression,
          postExpression: effectData.postExpression,
        });
      }

      await dbService.getDataSource().transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.getRepository('DogmaEffect').save(effectsToInsert);
      });

      console.log(`Imported ${effectsToInsert.length} Dogma effects.`);

    } catch (error) {
      console.error('Error importing Dogma effects:', error);
      throw error;
    }
  }

  private async importDogmaTypeEffects(): Promise<void> {
    try {
      this.sendProgress('importing_dogma_type_effects');
      console.log('Starting Dogma type effect import...');
      const dogmaTypeEffectsPath = path.join(this.sdePath, 'sde', 'fsd', 'dogma_type_effects.yaml');
      const dogmaTypeEffectsCachePath = path.join(this.sdePath, 'dogma_type_effects.json');
      let dogmaTypeEffects: Record<string, any>;

      if (await fs.pathExists(dogmaTypeEffectsCachePath)) {
        console.log('Loading Dogma type effects from cache...');
        dogmaTypeEffects = await fs.readJson(dogmaTypeEffectsCachePath);
      } else {
        console.log('Parsing dogma_type_effects.yaml...');
        const fileContents = await fs.readFile(dogmaTypeEffectsPath, 'utf8');
        dogmaTypeEffects = yaml.load(fileContents) as Record<string, any>;
        await fs.writeJson(dogmaTypeEffectsCachePath, dogmaTypeEffects);
        console.log('Saved Dogma type effects to cache.');
      }

      const dbService = DatabaseService.getInstance();
      const typeEffectsToInsert = [];

      for (const id in dogmaTypeEffects) {
        const typeEffectData = dogmaTypeEffects[id];
        typeEffectsToInsert.push({
          typeID: typeEffectData.typeID,
          effectID: typeEffectData.effectID,
        });
      }

      await dbService.getDataSource().transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.getRepository('DogmaTypeEffect').save(typeEffectsToInsert);
      });

      console.log(`Imported ${typeEffectsToInsert.length} Dogma type effects.`);

    } catch (error) {
      console.error('Error importing Dogma type effects:', error);
      throw error;
    }
  }

  private async importDogmaExpressions(): Promise<void> {
    try {
      this.sendProgress('importing_dogma_expressions');
      console.log('Starting Dogma expression import...');
      const dogmaExpressionsPath = path.join(this.sdePath, 'sde', 'fsd', 'dogma_expressions.yaml');
      const dogmaExpressionsCachePath = path.join(this.sdePath, 'dogma_expressions.json');
      let dogmaExpressions: Record<string, any>;

      if (await fs.pathExists(dogmaExpressionsCachePath)) {
        console.log('Loading Dogma expressions from cache...');
        dogmaExpressions = await fs.readJson(dogmaExpressionsCachePath);
      } else {
        console.log('Parsing dogma_expressions.yaml...');
        const fileContents = await fs.readFile(dogmaExpressionsPath, 'utf8');
        dogmaExpressions = yaml.load(fileContents) as Record<string, any>;
        await fs.writeJson(dogmaExpressionsCachePath, dogmaExpressions);
        console.log('Saved Dogma expressions to cache.');
      }

      const dbService = DatabaseService.getInstance();
      const expressionsToInsert = [];

      for (const id in dogmaExpressions) {
        const expressionData = dogmaExpressions[id];
        expressionsToInsert.push({
          expressionID: expressionData.expressionID,
          operandID: expressionData.operandID,
          arg1: expressionData.arg1,
          arg2: expressionData.arg2,
          expressionValue: expressionData.expressionValue,
          description: expressionData.description,
          expressionName: expressionData.expressionName,
          expressionTypeID: expressionData.expressionTypeID,
          expressionGroupID: expressionData.expressionGroupID,
          expressionAttributeID: expressionData.expressionAttributeID,
        });
      }

      await dbService.getDataSource().transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.getRepository('DogmaExpression').save(expressionsToInsert);
      });

      console.log(`Imported ${expressionsToInsert.length} Dogma expressions.`);

    } catch (error) {
      console.error('Error importing Dogma expressions:', error);
      throw error;
    }
  }
} 