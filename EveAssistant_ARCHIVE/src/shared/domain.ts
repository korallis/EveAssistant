import { z } from 'zod';

const ShipSchema = z.object({
  typeID: z.number(),
  typeName: z.string(),
  groupID: z.number(),
  slots: z.object({
    high: z.number(),
    mid: z.number(),
    low: z.number(),
    rig: z.number(),
    subsystem: z.number(),
  }),
  attributes: z.record(z.number()),
  bonuses: z.array(z.string()),
});

export class Ship implements IShip {
  typeID: number;
  typeName: string;
  groupID: number;
  slots: {
    high: number;
    mid: number;
    low: number;
    rig: number;
    subsystem: number;
  };
  attributes: Record<number, number>;
  bonuses: string[];
  subsystem: number;

  constructor(ship: IShip) {
    const validatedShip = ShipSchema.parse(ship);
    Object.assign(this, validatedShip);
  }

  static createFromSde(sdeData: any): Ship {
    const shipData: IShip = {
      typeID: sdeData.typeID,
      typeName: sdeData.name.en,
      groupID: sdeData.groupID,
      slots: {
        high: sdeData.dogmaAttributes.find((a: any) => a.attributeID === 14)?.value || 0,
        mid: sdeData.dogmaAttributes.find((a: any) => a.attributeID === 13)?.value || 0,
        low: sdeData.dogmaAttributes.find((a: any) => a.attributeID === 12)?.value || 0,
        rig: sdeData.dogmaAttributes.find((a: any) => a.attributeID === 1137)?.value || 0,
        subsystem: sdeData.dogmaAttributes.find((a: any) => a.attributeID === 1367)?.value || 0,
      },
      attributes: sdeData.dogmaAttributes.reduce((acc: Record<number, number>, attr: any) => {
        acc[attr.attributeID] = attr.value;
        return acc;
      }, {}),
      bonuses: sdeData.traits?.types?.map((t: any) => t.bonusText?.en) || [],
    };
    return new Ship(shipData);
  }
}

export class Fitting {
  ship: Ship;
  modules: IModule[];
  charges: any[]; // Replace with ICharge later
  drones: any[]; // Replace with IDrone later
  implants: any[]; // Replace with IImplant later

  constructor(ship: Ship) {
    this.ship = ship;
    this.modules = [];
    this.charges = [];
    this.drones = [];
    this.implants = [];
  }

  addModule(module: IModule): void {
    // TODO: Add validation to ensure module can be fitted
    this.modules.push(module);
  }

  removeModule(module: IModule): void {
    this.modules = this.modules.filter(m => m.typeID !== module.typeID);
  }
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

export interface IShip {
  typeID: number;
  typeName: string;
  groupID: number;
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

export interface ISkill {
  // ... existing code ...
} 