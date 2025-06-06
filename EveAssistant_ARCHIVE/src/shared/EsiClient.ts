export class EsiClient {
  public async getMarketPrices(region: string): Promise<any> {
    console.log(`[EsiClient] Getting market prices for region: ${region}`);
    return Promise.resolve([
      { type_id: 34, average_price: 5.6 },
      { type_id: 35, average_price: 10.2 },
    ]);
  }
} 