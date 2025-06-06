import { XMLParser } from 'fast-xml-parser';
import { Fitting, Item, Module } from '../renderer/store/slices/fittingStore';

export class XmlParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'XmlParserError';
  }
}

export class XmlParser {
  private xmlString: string;
  private parser: XMLParser;

  constructor(xmlString: string) {
    this.xmlString = xmlString;
    this.parser = new XMLParser();
  }

  public validate(): boolean {
    const parsed = this.parser.parse(this.xmlString, {
      validate: true,
    });
    if (parsed === false) {
      throw new XmlParserError('Invalid XML');
    }
    if (!parsed.fitting) {
      throw new XmlParserError('Invalid XML format: Missing <fitting> root element');
    }
    return true;
  }

  public parse(): Partial<Fitting> {
    this.validate();
    const parsed = this.parser.parse(this.xmlString);

    const fittingData = parsed.fitting;
    const fittingName = fittingData['@_name'];
    const shipType = fittingData.shipType['@_value'];

    const modules: Module[] = (fittingData.hardware || []).map((hardware: any) => {
      return {
        id: '', // Will be resolved later
        name: hardware['@_type'],
        slot: 'high', // Placeholder
      };
    });

    const drones: Item[] = (fittingData.droneBay?.drone || []).map((drone: any) => {
      return {
        id: '',
        name: drone['@_type'],
        quantity: drone['@_quantity'] || 1,
      };
    });

    const cargo: Item[] = (fittingData.cargoBay?.item || []).map((item: any) => {
      return {
        id: '',
        name: item['@_type'],
        quantity: item['@_quantity'] || 1,
      };
    });

    return {
      ship: {
        id: 0, // Will be resolved later
        name: shipType,
        slots: { highSlots: 8, midSlots: 8, lowSlots: 8 }, // Placeholder
      },
      modules,
      drones,
      cargo,
    };
  }
} 