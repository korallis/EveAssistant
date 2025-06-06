import { Fitting } from '../renderer/store/slices/fittingStore';
import { Skill } from '../renderer/store/slices/skillsStore';
import { GoalWeights, SkillPlanGeneticAlgorithm } from './SkillPlanGeneticAlgorithm';

export interface CharacterAttributes {
  intelligence: number;
  perception: number;
  charisma: number;
  willpower: number;
  memory: number;
}

export class SkillOptimizer {
  private characterSkills: Skill[];
  private targetFitting: Fitting;

  constructor(characterSkills: Skill[], targetFitting: Fitting) {
    this.characterSkills = characterSkills;
    this.targetFitting = targetFitting;
  }

  public generateSkillPlan(weights: GoalWeights = { trainingTime: 0.5, unlockedModules: 0.5 }): Skill[] {
    const requiredSkills = this.getRequiredSkills();
    
    const attributes: CharacterAttributes = {
      intelligence: 20,
      perception: 20,
      charisma: 20,
      willpower: 20,
      memory: 20,
    };
    
    const ga = new SkillPlanGeneticAlgorithm(
      100, // populationSize
      0.01, // mutationRate
      0.8, // crossoverRate
      100, // generations
      attributes,
      this.targetFitting,
      weights,
    );

    return ga.run(requiredSkills);
  }

  private getRequiredSkills(): Skill[] {
    const requiredSkills: Map<string, number> = new Map();

    // Get all required skills from the fitting
    this.targetFitting.modules.forEach(module => {
      if (module.requirements) {
        Object.entries(module.requirements).forEach(([skillId, level]) => {
          if ((requiredSkills.get(skillId) || 0) < level) {
            requiredSkills.set(skillId, level);
          }
        });
      }
    });

    // Filter out skills that the character already has at the required level
    const missingSkills: Skill[] = [];
    requiredSkills.forEach((level, skillId) => {
      const characterSkill = this.characterSkills.find(s => s.skillId.toString() === skillId);
      if (!characterSkill || characterSkill.trainedLevel < level) {
        // This is a placeholder. We would need to fetch the full skill info
        // from the SDE if it's not in the character's skill list.
        missingSkills.push({
          id: skillId,
          skillId: parseInt(skillId),
          name: `Skill ID: ${skillId}`, // Placeholder name
          group: 'Unknown',
          rank: 1,
          primaryAttribute: 'intelligence',
          secondaryAttribute: 'memory',
          trainedLevel: characterSkill ? characterSkill.trainedLevel : 0,
          targetLevel: level,
          skillpoints: characterSkill ? characterSkill.skillpoints : 0,
        });
      }
    });

    return missingSkills;
  }
} 