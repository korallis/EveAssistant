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
  attributes: Record<number, number>;
  bonuses: string[];
}

export interface IModule {
  typeID: number;
  typeName: string;
  groupID: number;
  attributes: Record<number, number>;
  effects: Record<number, number>;
  cpu: number;
  powergrid: number;
} 