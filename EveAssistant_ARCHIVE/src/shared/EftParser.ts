import { Fitting, Item, Module } from '../renderer/store/slices/fittingStore';

export class EftParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EftParserError';
  }
}

export class EftParser {
  private eftString: string;

  constructor(eftString: string) {
    this.eftString = eftString;
  }

  public validate(): boolean {
    const lines = this.eftString.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      throw new EftParserError('Empty EFT string');
    }

    const [shipLine] = lines;
    const shipMatch = shipLine.match(/\[(.*), (.*)\]/);

    if (!shipMatch) {
      throw new EftParserError('Invalid EFT format: Ship line is incorrect');
    }

    return true;
  }

  public parse(): Partial<Fitting> {
    this.validate();
    const lines = this.eftString.split('\n').filter(line => line.trim() !== '');

    const [shipLine] = lines;
    const shipMatch = shipLine.match(/\[(.*), (.*)\]/)!;
    const [, shipName, fittingName] = shipMatch;

    const moduleLines: string[] = [];
    const droneLines: string[] = [];
    const cargoLines: string[] = [];

    let currentSection = 'modules';

    for (const line of lines.slice(1)) {
      if (line.trim() === '') {
        currentSection = 'drones/cargo';
        continue;
      }

      if (currentSection === 'modules') {
        moduleLines.push(line);
      } else {
        // Simple check for drones, needs improvement
        if (line.includes(' x')) {
          droneLines.push(line);
        } else {
          cargoLines.push(line);
        }
      }
    }

    const modules: Module[] = moduleLines.map(line => {
      // Basic parsing, will need to be improved
      const [moduleName] = line.split(',');
      return {
        id: '', // Will be resolved later
        name: moduleName.trim(),
        slot: 'high', // Placeholder
      };
    });

    const drones: Item[] = droneLines.map(line => {
      const [name, quantity] = line.split(' x');
      return { id: '', name: name.trim(), quantity: parseInt(quantity, 10) };
    });

    const cargo: Item[] = cargoLines.map(line => {
      return { id: '', name: line.trim(), quantity: 1 };
    });

    return {
      ship: {
        id: 0, // Will be resolved later
        name: shipName.trim(),
        slots: { highSlots: 8, midSlots: 8, lowSlots: 8 }, // Placeholder
      },
      modules,
      drones,
      cargo,
    };
  }
} 