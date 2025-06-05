import geneticalgorithm from 'geneticalgorithm';
import { FittingCalculator } from '../FittingCalculator';
import { IFitting, IShip } from '../domain';

export class FittingOptimizer {
  private options: any;
  private ship: IShip;

  constructor(ship: IShip) {
    this.ship = ship;
    this.options = {
      mutationFunction: this.mutationFunction,
      crossoverFunction: this.crossoverFunction,
      fitnessFunction: this.fitnessFunction,
      population: this.createInitialPopulation(),
    };
  }

  public optimizeFitting() {
    this.evolve();
    const bestFitting = this.options.population[0];
    return bestFitting;
  }

  public evolve() {
    const population = this.options.population;
    const fronts = this.nonDominatedSort(population);
    for (const front of fronts) {
      this.crowdingDistance(front);
    }

    const newPopulation = [];
    while (newPopulation.length < population.length) {
      const p1 = this.selection(population);
      const p2 = this.selection(population);
      const [c1, c2] = this.crossoverFunction(p1, p2);
      newPopulation.push(this.mutationFunction(c1));
      newPopulation.push(this.mutationFunction(c2));
    }

    this.options.population = newPopulation;
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
    // TODO: Implement mutation logic
    return phenotype;
  }

  private crossoverFunction(phenotypeA, phenotypeB) {
    // TODO: Implement crossover logic
    return [phenotypeA, phenotypeB];
  }

  private fitnessFunction(phenotype: IFitting): number[] {
    const calculator = new FittingCalculator(phenotype);
    const dps = calculator.calculateDps();
    const ehp = calculator.calculateEhp();
    const cap = calculator.calculateCapacitor();
    return [dps, ehp, cap.stable ? 1 : 0];
  }

  private createInitialPopulation(): IFitting[] {
    const population = [];
    for (let i = 0; i < 100; i++) {
      const fitting: IFitting = {
        ship: this.ship,
        modules: [],
        skills: [],
      };
      window.dogma.getModules().then(modules => {
        for (let j = 0; j < 8; j++) {
          const randomModule = modules[Math.floor(Math.random() * modules.length)];
          fitting.modules.push(randomModule);
        }
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
} 