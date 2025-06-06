import { Fitting } from '../renderer/store/slices/fittingStore';
import { Ship } from '../renderer/store/slices/shipStore';

type Individual = Fitting;

export interface GoalWeights {
  dps: number;
  tank: number;
  capacitor: number;
  speed: number;
  range: number;
}

export class FittingOptimizer {
  private population: Individual[] = [];
  private populationSize: number;
  private mutationRate: number;
  private crossoverRate: number;
  private generations: number;
  private ship: Ship;
  private modules: any[];
  private weights: GoalWeights;

  constructor(
    ship: Ship,
    modules: any[],
    populationSize: number,
    mutationRate: number,
    crossoverRate: number,
    generations: number,
    weights: GoalWeights,
  ) {
    this.ship = ship;
    this.modules = modules;
    this.populationSize = populationSize;
    this.mutationRate = mutationRate;
    this.crossoverRate = crossoverRate;
    this.generations = generations;
    this.weights = weights;
  }

  public setWeights(weights: GoalWeights): void {
    this.weights = weights;
  }

  public run(): Individual[] {
    this.initializePopulation();

    for (let i = 0; i < this.generations; i++) {
      const fitnesses = this.calculateFitness();
      const newPopulation = [];
      for (let j = 0; j < this.population.length; j++) {
        const parent1 = this.selection(fitnesses);
        const parent2 = this.selection(fitnesses);
        let child = this.crossover(parent1, parent2);
        child = this.mutate(child);
        newPopulation.push(child);
      }
      this.population = newPopulation;
    }

    return this.getBestIndividuals();
  }

  private initializePopulation(): void {
    for (let i = 0; i < this.populationSize; i++) {
      this.population.push(this.createRandomFitting());
    }
  }

  private createRandomFitting(): Fitting {
    const fitting: Fitting = {
      id: '',
      name: 'Random Fitting',
      ship: this.ship,
      modules: [],
      stats: { dps: 0, tank: 0, capacitor: 0, speed: 0, range: 0 },
    };

    const slots = this.ship.slots;
    const availableModules = this.modules;

    for (let i = 0; i < slots.high; i++) {
      const highSlotModules = availableModules.filter(m => m.slot === 'high');
      const randomModule = highSlotModules[Math.floor(Math.random() * highSlotModules.length)];
      fitting.modules.push(randomModule);
    }

    for (let i = 0; i < slots.mid; i++) {
      const midSlotModules = availableModules.filter(m => m.slot === 'mid');
      const randomModule = midSlotModules[Math.floor(Math.random() * midSlotModules.length)];
      fitting.modules.push(randomModule);
    }

    for (let i = 0; i < slots.low; i++) {
      const lowSlotModules = availableModules.filter(m => m.slot === 'low');
      const randomModule = lowSlotModules[Math.floor(Math.random() * lowSlotModules.length)];
      fitting.modules.push(randomModule);
    }

    return fitting;
  }

  private calculateFitness(): number[] {
    return this.population.map(fitting => {
      const stats = fitting.stats;
      const weights = this.weights;

      const fitness =
        stats.dps * weights.dps +
        stats.tank * weights.tank +
        stats.capacitor * weights.capacitor +
        stats.speed * weights.speed +
        stats.range * weights.range;

      return fitness;
    });
  }

  private selection(fitnesses: number[]): Individual {
    const tournamentSize = 5;
    let bestIndividual: Individual | null = null;
    let bestFitness = -1;

    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      if (fitnesses[randomIndex] > bestFitness) {
        bestFitness = fitnesses[randomIndex];
        bestIndividual = this.population[randomIndex];
      }
    }

    return bestIndividual!;
  }

  private crossover(parent1: Individual, parent2: Individual): Individual {
    if (Math.random() > this.crossoverRate) {
      return parent1;
    }

    const child: Individual = {
      id: '',
      name: 'Child Fitting',
      ship: this.ship,
      modules: [],
      stats: { dps: 0, tank: 0, capacitor: 0, speed: 0, range: 0 },
    };

    const crossoverPoint = Math.floor(Math.random() * parent1.modules.length);
    child.modules = parent1.modules.slice(0, crossoverPoint);

    parent2.modules.forEach(module => {
      if (child.modules.length < parent1.modules.length) {
        child.modules.push(module);
      }
    });

    return child;
  }

  private mutate(individual: Individual): Individual {
    if (Math.random() > this.mutationRate) {
      return individual;
    }

    const mutationType = Math.random();
    if (mutationType < 0.33) {
      // Add a module
      const availableSlots = this.getAvailableSlots(individual);
      if (availableSlots.length > 0) {
        const slot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
        const modulesForSlot = this.modules.filter(m => m.slot === slot);
        const randomModule = modulesForSlot[Math.floor(Math.random() * modulesForSlot.length)];
        individual.modules.push(randomModule);
      }
    } else if (mutationType < 0.66) {
      // Remove a module
      if (individual.modules.length > 0) {
        const randomIndex = Math.floor(Math.random() * individual.modules.length);
        individual.modules.splice(randomIndex, 1);
      }
    } else {
      // Replace a module
      if (individual.modules.length > 0) {
        const randomIndex = Math.floor(Math.random() * individual.modules.length);
        const oldModule = individual.modules[randomIndex];
        const modulesForSlot = this.modules.filter(m => m.slot === oldModule.slot);
        const randomModule = modulesForSlot[Math.floor(Math.random() * modulesForSlot.length)];
        individual.modules[randomIndex] = randomModule;
      }
    }

    return individual;
  }

  private getAvailableSlots(fitting: Fitting): string[] {
    const slots = this.ship.slots;
    const availableSlots: string[] = [];

    const highSlotsUsed = fitting.modules.filter(m => m.slot === 'high').length;
    if (highSlotsUsed < slots.high) {
      availableSlots.push('high');
    }

    const midSlotsUsed = fitting.modules.filter(m => m.slot === 'mid').length;
    if (midSlotsUsed < slots.mid) {
      availableSlots.push('mid');
    }

    const lowSlotsUsed = fitting.modules.filter(m => m.slot === 'low').length;
    if (lowSlotsUsed < slots.low) {
      availableSlots.push('low');
    }

    return availableSlots;
  }

  private getBestIndividuals(): Individual[] {
    const fitnesses = this.calculateFitness();
    const sortedPopulation = this.population
      .map((individual, index) => ({ individual, fitness: fitnesses[index] }))
      .sort((a, b) => b.fitness - a.fitness)
      .map(item => item.individual);

    return sortedPopulation.slice(0, 5);
  }
} 