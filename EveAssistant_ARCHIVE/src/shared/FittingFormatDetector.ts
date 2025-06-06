export enum FittingFormat {
  EFT = 'EFT',
  XML = 'XML',
  Unknown = 'Unknown',
}

export class FittingFormatDetector {
  private fittingString: string;

  constructor(fittingString: string) {
    this.fittingString = fittingString.trim();
  }

  public detect(): FittingFormat {
    if (this.isXml()) {
      return FittingFormat.XML;
    }
    if (this.isEft()) {
      return FittingFormat.EFT;
    }
    return FittingFormat.Unknown;
  }

  private isXml(): boolean {
    return this.fittingString.startsWith('<');
  }

  private isEft(): boolean {
    return this.fittingString.startsWith('[');
  }
} 