import { AppDataSource } from '../db/dataSource';
import { CommonFit } from '../db/entities/CommonFit.entity';
import { Repository } from 'typeorm';

export class CommonFitService {
  private commonFitRepository: Repository<CommonFit>;

  constructor() {
    this.commonFitRepository = AppDataSource.getRepository(CommonFit);
  }

  async getAllFits(): Promise<CommonFit[]> {
    return this.commonFitRepository.find();
  }

  async getFitById(id: string): Promise<CommonFit | null> {
    return this.commonFitRepository.findOneBy({ id });
  }

  async saveFit(fit: CommonFit): Promise<CommonFit> {
    return this.commonFitRepository.save(fit);
  }

  async deleteFit(id: string): Promise<void> {
    await this.commonFitRepository.delete(id);
  }
} 