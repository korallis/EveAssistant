export interface IShip {
  typeID: number;
  typeName: string;
  slots: {
    high: number;
    mid: number;
    low: number;
    rig: number;
    subsystem: number;
  };
  attributes: Record<string, number>;
  bonuses: string[];
}

export interface IModule {
  typeID: number;
  typeName:string;
  slot: 'high' | 'mid' | 'low' | 'rig' | 'subsystem';
  meta: number;
  attributes: Record<string, number>;
  requirements: Record<string, number>;
} 