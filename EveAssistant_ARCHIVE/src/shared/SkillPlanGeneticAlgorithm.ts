import { Fitting } from '../renderer/store/slices/fittingStore';
import { Skill } from '../renderer/store/slices/skillsStore';
import { CharacterAttributes } from './SkillOptimizer';

type Individual = Skill[];

export interface GoalWeights {
  trainingTime: number;
  unlockedModules: number;
}

export class SkillPlanGeneticAlgorithm {
  private population: Individual[] = [];
  private populationSize: number;
  private mutationRate: number;
  private crossoverRate: number;
  private generations: number;
  private attributes: CharacterAttributes;
  private fitting: Fitting;
  private weights: GoalWeights;

  constructor(
    populationSize: number,
    mutationRate: number,
    crossoverRate: number,
    generations: number,
    attributes: CharacterAttributes,
    fitting: Fitting,
    weights: GoalWeights,
  ) {
    this.populationSize = populationSize;
    this.mutationRate = mutationRate;
    this.crossoverRate = crossoverRate;
    this.generations = generations;
    this.attributes = attributes;
    this.fitting = fitting;
    this.weights = weights;
  }

  public run(initialSkills: Skill[]): Individual {
    this.initializePopulation(initialSkills);

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

    return this.getBestIndividual();
  }

  private initializePopulation(initialSkills: Skill[]): void {
    for (let i = 0; i < this.populationSize; i++) {
      this.population.push(this.shuffle(initialSkills));
    }
  }

  private shuffle(array: any[]): any[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  private calculateFitness(): number[] {
    return this.population.map(individual => {
      const trainingTime = this.calculateTotalTrainingTime(individual);
      const unlockedModules = this.calculateUnlockedModules(individual);

      // We want to minimize training time and maximize unlocked modules.
      // We will use a weighted sum for the fitness. The weights can be tuned.
      const trainingTimeWeight = this.weights.trainingTime;
      const unlockedModulesWeight = this.weights.unlockedModules;

      // Normalize the values to be between 0 and 1.
      // This is a simplified normalization. A more robust solution would be to
      // normalize based on the min/max values in the population.
      const maxTrainingTime = 86400 * 365; // 1 year in seconds
      const normalizedTrainingTime = 1 - (trainingTime / maxTrainingTime);
      const normalizedUnlockedModules = unlockedModules / this.fitting.modules.length;

      return (
        normalizedTrainingTime * trainingTimeWeight +
        normalizedUnlockedModules * unlockedModulesWeight
      );
    });
  }

  private calculateUnlockedModules(individual: Individual): number {
    let unlockedModules = 0;
    const trainedSkills: { [skillId: string]: number } = {};

    individual.forEach(skill => {
      trainedSkills[skill.skillId] = skill.targetLevel!;
    });

    this.fitting.modules.forEach(module => {
      let canUseModule = true;
      if (module.requirements) {
        Object.entries(module.requirements).forEach(([skillId, level]) => {
          if ((trainedSkills[skillId] || 0) < level) {
            canUseModule = false;
          }
        });
      }
      if (canUseModule) {
        unlockedModules++;
      }
    });

    return unlockedModules;
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

    const crossoverPoint = Math.floor(Math.random() * parent1.length);
    const child = parent1.slice(0, crossoverPoint);

    parent2.forEach(skill => {
      if (!child.some(s => s.id === skill.id)) {
        child.push(skill);
      }
    });

    return child;
  }

  private mutate(individual: Individual): Individual {
    if (Math.random() > this.mutationRate) {
      return individual;
    }

    const index1 = Math.floor(Math.random() * individual.length);
    const index2 = Math.floor(Math.random() * individual.length);

    const newIndividual = [...individual];
    [newIndividual[index1], newIndividual[index2]] = [newIndividual[index2], newIndividual[index1]];

    return newIndividual;
  }

  private calculateTotalTrainingTime(individual: Individual): number {
    let totalTime = 0;
    individual.forEach(skill => {
      totalTime += this.calculateTrainingTime(skill, skill.targetLevel!);
    });
    return totalTime;
  }

  private calculateTrainingTime(skill: Skill, targetLevel: number): number {
    const spPerMinute = this.getSpPerMinute(skill, this.attributes);
    const requiredSp = this.getRequiredSp(skill, targetLevel);
    const currentSp = skill.skillpoints;
    const spNeeded = requiredSp - currentSp;

    if (spNeeded <= 0) {
      return 0;
    }

    return (spNeeded / spPerMinute) * 60; // Return time in seconds
  }

  private getSpPerMinute(skill: Skill, attributes: CharacterAttributes): number {
    let primaryAttributeValue = 0;
    let secondaryAttributeValue = 0;

    switch (skill.primaryAttribute) {
      case 'intelligence':
        primaryAttributeValue = attributes.intelligence;
        break;
      case 'perception':
        primaryAttributeValue = attributes.perception;
        break;
      case 'charisma':
        primaryAttributeValue = attributes.charisma;
        break;
      case 'willpower':
        primaryAttributeValue = attributes.willpower;
        break;
      case 'memory':
        primaryAttributeValue = attributes.memory;
        break;
    }

    switch (skill.secondaryAttribute) {
      case 'intelligence':
        secondaryAttributeValue = attributes.intelligence;
        break;
      case 'perception':
        secondaryAttributeValue = attributes.perception;
        break;
      case 'charisma':
        secondaryAttributeValue = attributes.charisma;
        break;
      case 'willpower':
        secondaryAttributeValue = attributes.willpower;
        break;
      case 'memory':
        secondaryAttributeValue = attributes.memory;
        break;
    }

    return primaryAttributeValue + secondaryAttributeValue / 2;
  }

  private getRequiredSp(skill: Skill, level: number): number {
    if (level === 0) {
      return 0;
    }
    return Math.ceil(250 * skill.rank * Math.pow(Math.sqrt(32), level - 1));
  }

  private getBestIndividual(): Individual {
    const fitnesses = this.calculateFitness();
    let bestFitness = -1;
    let bestIndividual: Individual | null = null;

    for (let i = 0; i < this.population.length; i++) {
      if (fitnesses[i] > bestFitness) {
        bestFitness = fitnesses[i];
        bestIndividual = this.population[i];
      }
    }

    return bestIndividual!;
  }
} 