import geneticalgorithm from 'geneticalgorithm';
import { FittingCalculator } from '../FittingCalculator';
import { Fitting as IFitting } from './domain';
import { IModule, IShip } from './types/domain.types';
import { ActivityProfile } from '../../renderer/features/fitting-optimizer/types';

export class FittingOptimizer {
  private options: any;
  private ship: IShip;
  private convergenceCounter: number;
  private activityProfile?: ActivityProfile;
  private fitnessWeights: { [key: string]: number };

  constructor(ship: IShip, options: any = {}, activityProfile?: ActivityProfile) {
    this.ship = ship;
    this.activityProfile = activityProfile;
    this.fitnessWeights = options.fitnessWeights || {
      dps: 1,
      ehp: 1,
      capacitor: 1,
      cpu: 1,
      powergrid: 1,
      constraints: 100,
    };
    this.options = {
      mutationFunction: this.mutationFunction,
      crossoverFunction: this.crossoverFunction,
      fitnessFunction: this.fitnessFunction.bind(this),
      population: this.createInitialPopulation(),
      populationSize: options.populationSize || 100,
      mutationProbability: options.mutationProbability || 0.1,
      crossoverProbability: options.crossoverProbability || 0.8,
      maxGenerations: options.maxGenerations || 100,
      convergenceThreshold: options.convergenceThreshold || 10,
    };
    this.convergenceCounter = 0;
  }

  public optimizeFitting() {
    for (let i = 0; i < this.options.maxGenerations; i++) {
      this.evolve();
      if (this.convergenceCounter >= this.options.convergenceThreshold) {
        break;
      }
    }
    const bestFitting = this.getRepresentativeFittings();
    return bestFitting;
  }

  public evolve() {
    const population = this.options.population;
    const bestFitness = population[0].fitness;

    const offspring = [];
    while (offspring.length < population.length) {
      const p1 = this.selection(population);
      const p2 = this.selection(population);
      const [c1, c2] = this.crossoverFunction(p1, p2);
      offspring.push(this.mutationFunction(c1));
      offspring.push(this.mutationFunction(c2));
    }

    const combinedPopulation = [...population, ...offspring];
    const fronts = this.nonDominatedSort(combinedPopulation);

    const newPopulation = [];
    let frontIndex = 0;
    while (newPopulation.length + fronts[frontIndex].length <= population.length) {
      newPopulation.push(...fronts[frontIndex]);
      frontIndex++;
    }

    const lastFront = fronts[frontIndex];
    this.crowdingDistance(lastFront);
    lastFront.sort((a, b) => b.crowdingDistance - a.crowdingDistance);

    const remaining = population.length - newPopulation.length;
    newPopulation.push(...lastFront.slice(0, remaining));

    this.options.population = newPopulation;

    if (bestFitness === newPopulation[0].fitness) {
      this.convergenceCounter++;
    } else {
      this.convergenceCounter = 0;
    }
  }

  private selection(population) {
    const i = Math.floor(Math.random() * population.length);
    const j = Math.floor(Math.random() * population.length);
    const p1 = population[i];
    const p2 = population[j];

    if (p1.rank < p2.rank) {
      return p1;
    } else if (p2.rank < p1.rank) {
      return p2;
    } else {
      if (p1.crowdingDistance > p2.crowdingDistance) {
        return p1;
      } else {
        return p2;
      }
    }
  }

  private mutationFunction(phenotype) {
    if (Math.random() > this.options.mutationProbability) {
      return phenotype;
    }
    const mutationPoint = Math.floor(Math.random() * phenotype.modules.length);
    window.dogma.getModules().then(modules => {
      let randomModule: IModule;

      if (this.activityProfile?.constraints) {
        const { allowedShipTypes, disallowedModules } = this.activityProfile.constraints;
        let candidateModules = modules;

        if (disallowedModules) {
          candidateModules = candidateModules.filter(m => !disallowedModules.includes(m.typeID));
        }

        // A simple attempt to get a module that might fit the ship's slots
        // This could be improved by checking the actual slot type
        if (allowedShipTypes && phenotype.ship) {
           // A more complex logic would be needed here to select a module based on available slots
        }
        
        randomModule = candidateModules[Math.floor(Math.random() * candidateModules.length)];
      } else {
        randomModule = modules[Math.floor(Math.random() * modules.length)];
      }

      phenotype.modules[mutationPoint] = randomModule;
    });
    return phenotype;
  }

  private crossoverFunction(phenotypeA, phenotypeB) {
    if (Math.random() > this.options.crossoverProbability) {
      return [phenotypeA, phenotypeB];
    }
    const crossoverPoint = Math.floor(Math.random() * phenotypeA.modules.length);
    const newPhenotypeA = {
      ...phenotypeA,
      modules: [
        ...phenotypeA.modules.slice(0, crossoverPoint),
        ...phenotypeB.modules.slice(crossoverPoint),
      ],
    };
    const newPhenotypeB = {
      ...phenotypeB,
      modules: [
        ...phenotypeB.modules.slice(0, crossoverPoint),
        ...phenotypeA.modules.slice(crossoverPoint),
      ],
    };
    return [newPhenotypeA, newPhenotypeB];
  }

  private calculateDpsFitness(calculator: FittingCalculator): number {
    return calculator.calculateDps();
  }

  private calculateEhpFitness(calculator: FittingCalculator): number {
    return calculator.calculateEhp();
  }

  private calculateCapacitorFitness(calculator: FittingCalculator): number {
    const cap = calculator.calculateCapacitor();
    return cap.stable ? cap.stableTime : cap.stableTime - 1000;
  }

  private calculateResourceFitness(phenotype: IFitting, calculator: FittingCalculator): number {
    const cpu = calculator.calculateCpu();
    const powergrid = calculator.calculatePowergrid();
    let penalty = 0;
    if (cpu.usage > cpu.output) {
      const diff = cpu.usage - cpu.output;
      penalty += diff * this.fitnessWeights.cpu;
      phenotype.trace.push(`CPU usage exceeds output by ${diff.toFixed(2)}. Penalty: ${penalty.toFixed(2)}`);
    }
    if (powergrid.usage > powergrid.output) {
      const diff = powergrid.usage - powergrid.output;
      penalty += diff * this.fitnessWeights.powergrid;
      phenotype.trace.push(`Powergrid usage exceeds output by ${diff.toFixed(2)}. Penalty: ${penalty.toFixed(2)}`);
    }
    return -penalty;
  }

  private calculateConstraintFitness(phenotype: IFitting, calculator: FittingCalculator): number {
    let penalty = 0;
    if (this.activityProfile) {
      const { constraints } = this.activityProfile;
      if (constraints.allowedShipTypes && !constraints.allowedShipTypes.includes(phenotype.ship.typeID)) {
        penalty += 1000;
        phenotype.trace.push(`Ship type ${phenotype.ship.typeName} is not allowed.`);
      }
      if (constraints.requiredModules) {
        for (const requiredModule of constraints.requiredModules) {
          if (!phenotype.modules.find(m => m.typeID === requiredModule)) {
            penalty += 100;
            phenotype.trace.push(`Missing required module ID ${requiredModule}.`);
          }
        }
      }
      if (constraints.minDps && calculator.calculateDps() < constraints.minDps) {
        const diff = constraints.minDps - calculator.calculateDps();
        penalty += diff;
        phenotype.trace.push(`DPS is ${diff.toFixed(2)} below minimum.`);
      }
      if (constraints.minEhp && calculator.calculateEhp() < constraints.minEhp) {
        const diff = constraints.minEhp - calculator.calculateEhp();
        penalty += diff;
        phenotype.trace.push(`EHP is ${diff.toFixed(2)} below minimum.`);
      }
      if (constraints.minCapacitorStable && !calculator.calculateCapacitor().stable) {
        penalty += 100;
        phenotype.trace.push(`Capacitor is not stable.`);
      }
    }
    return -penalty * this.fitnessWeights.constraints;
  }

  private fitnessFunction(phenotype: IFitting): number[] {
    phenotype.trace = [];
    const calculator = new FittingCalculator(phenotype);
    
    const dpsFitness = this.calculateDpsFitness(calculator) * this.fitnessWeights.dps;
    const ehpFitness = this.calculateEhpFitness(calculator) * this.fitnessWeights.ehp;
    const capacitorFitness = this.calculateCapacitorFitness(calculator) * this.fitnessWeights.capacitor;
    const resourceFitness = this.calculateResourceFitness(phenotype, calculator);
    const constraintFitness = this.calculateConstraintFitness(phenotype, calculator);

    const totalFitness = dpsFitness + ehpFitness + capacitorFitness + resourceFitness + constraintFitness;

    return [totalFitness, dpsFitness, ehpFitness, capacitorFitness];
  }

  private createInitialPopulation(): IFitting[] {
    const population = [];
    for (let i = 0; i < this.options.populationSize; i++) {
      const fitting: IFitting = {
        ship: this.ship,
        modules: [],
        skills: [],
      };
      window.dogma.getModules().then(modules => {
        const selectedModules: IModule[] = [];

        if (this.activityProfile?.constraints.requiredModules) {
          for (const requiredModuleId of this.activityProfile.constraints.requiredModules) {
            const module = modules.find(m => m.typeID === requiredModuleId);
            if (module) {
              selectedModules.push(module);
            }
          }
        }
        
        const remainingSlots = 8 - selectedModules.length;
        for (let j = 0; j < remainingSlots; j++) {
          const randomModule = modules[Math.floor(Math.random() * modules.length)];
          selectedModules.push(randomModule);
        }
        fitting.modules = selectedModules;
      });
      population.push(fitting);
    }
    return population;
  }

  private nonDominatedSort(population) {
    const fronts = [];
    let currentFront = [];

    for (const p of population) {
      p.dominationCount = 0;
      p.dominatedSolutions = [];
      for (const q of population) {
        if (this.dominates(p, q)) {
          p.dominatedSolutions.push(q);
        } else if (this.dominates(q, p)) {
          p.dominationCount++;
        }
      }
      if (p.dominationCount === 0) {
        p.rank = 0;
        currentFront.push(p);
      }
    }

    let i = 0;
    while (currentFront.length > 0) {
      fronts.push(currentFront);
      const nextFront = [];
      for (const p of currentFront) {
        for (const q of p.dominatedSolutions) {
          q.dominationCount--;
          if (q.dominationCount === 0) {
            q.rank = i + 1;
            nextFront.push(q);
          }
        }
      }
      i++;
      currentFront = nextFront;
    }

    return fronts;
  }

  private dominates(p, q) {
    let pIsBetter = false;
    for (let i = 0; i < p.fitness.length; i++) {
      if (p.fitness[i] > q.fitness[i]) {
        pIsBetter = true;
      } else if (p.fitness[i] < q.fitness[i]) {
        return false;
      }
    }
    return pIsBetter;
  }

  private crowdingDistance(front) {
    for (const p of front) {
      p.crowdingDistance = 0;
    }

    for (let i = 0; i < front[0].fitness.length; i++) {
      front.sort((a, b) => a.fitness[i] - b.fitness[i]);
      front[0].crowdingDistance = Infinity;
      front[front.length - 1].crowdingDistance = Infinity;
      for (let j = 1; j < front.length - 1; j++) {
        front[j].crowdingDistance += (front[j + 1].fitness[i] - front[j - 1].fitness[i]);
      }
    }
  }

  private getRepresentativeFittings() {
    const population = this.options.population;
    const fronts = this.nonDominatedSort(population);
    const firstFront = fronts[0];
    this.crowdingDistance(firstFront);
    firstFront.sort((a, b) => b.crowdingDistance - a.crowdingDistance);

    const representativeFittings = [];
    for (let i = 0; i < 5; i++) {
      const index = Math.floor(i * (firstFront.length / 5));
      representativeFittings.push(firstFront[index]);
    }
    return representativeFittings;
  }
} 
} 