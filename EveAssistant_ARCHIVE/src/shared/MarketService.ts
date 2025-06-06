import { EsiClient } from './EsiClient';
import { CacheManager } from './CacheManager';
import { Fitting } from '../renderer/store/slices/fittingStore';

const cacheManager = new CacheManager();

export class MarketService {
  private esiClient: EsiClient;
  private region: string;
  private budget: number | null;

  constructor() {
    this.esiClient = new EsiClient();
    this.region = 'jita'; // Default region
    this.budget = null;
  }

  public setRegion(region: string): void {
    this.region = region;
  }

  public setBudget(budget: number): void {
    this.budget = budget;
  }

  public async getPrices(): Promise<any> {
    const cacheKey = `prices-${this.region}`;
    const cachedPrices = cacheManager.get(cacheKey);
    if (cachedPrices) {
      return cachedPrices;
    }

    const prices = await this.esiClient.getMarketPrices(this.region);
    cacheManager.set(cacheKey, prices, 300);
    return prices;
  }

  public async calculateFittingCost(fitting: Fitting): Promise<number> {
    const prices = await this.getPrices();
    let totalCost = 0;

    for (const module of fitting.modules) {
      const price = prices.find((p: any) => p.type_id === parseInt(module.id, 10));
      if (price) {
        totalCost += price.average_price;
      }
    }

    if (this.budget && totalCost > this.budget) {
      throw new Error('Fitting cost exceeds budget');
    }

    return totalCost;
  }
} 