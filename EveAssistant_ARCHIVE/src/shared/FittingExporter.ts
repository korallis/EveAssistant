import { Fitting } from '../renderer/store/slices/fittingStore';

export class FittingExporter {
  private fitting: Fitting;

  constructor(fitting: Fitting) {
    this.fitting = fitting;
  }

  public toEft(): string {
    const shipLine = `[${this.fitting.ship.name}, New Fitting]`;
    const moduleLines = this.fitting.modules.map(module => module.name);
    const droneLines = this.fitting.drones.map(drone => `${drone.name} x${drone.quantity}`);
    const cargoLines = this.fitting.cargo.map(item => item.name);

    let eft = [shipLine, ...moduleLines].join('\n');
    if (droneLines.length > 0) {
      eft += '\n\n' + droneLines.join('\n');
    }
    if (cargoLines.length > 0) {
      eft += '\n\n' + cargoLines.join('\n');
    }

    return eft;
  }

  public toXml(): string {
    const modules = this.fitting.modules.map(module => `  <hardware type="${module.name}" />`).join('\n');
    const drones = this.fitting.drones.map(drone => `    <drone type="${drone.name}" quantity="${drone.quantity}" />`).join('\n');
    const cargo = this.fitting.cargo.map(item => `    <item type="${item.name}" quantity="${item.quantity}" />`).join('\n');

    return `<fitting name="New Fitting">
  <shipType value="${this.fitting.ship.name}" />
  <hardware>
${modules}
  </hardware>
  <droneBay>
${drones}
  </droneBay>
  <cargoBay>
${cargo}
  </cargoBay>
</fitting>`;
  }
} 