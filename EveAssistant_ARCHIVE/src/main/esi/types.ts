export interface EsiSkill {
  skill_id: number;
  active_skill_level: number;
  skillpoints_in_skill: number;
  trained_skill_level: number;
}

export interface EsiSkills {
  skills: EsiSkill[];
  total_sp: number;
  unallocated_sp?: number;
} 