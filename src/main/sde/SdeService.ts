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
} 