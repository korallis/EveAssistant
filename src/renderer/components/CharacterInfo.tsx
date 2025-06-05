import React, { useEffect, useState } from 'react';

export interface CharacterSkills {
  skills: {
    skill_id: number;
    active_skill_level: number;
    trained_skill_level: number;
  }[];
  total_sp: number;
  unallocated_sp: number;
}

interface CharacterInfoProps {
  characterId: number;
}

export const CharacterInfo: React.FC<CharacterInfoProps> = ({ characterId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<CharacterSkills | null>(null);

  useEffect(() => {
    const fetchCharacterSkills = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be an IPC call to the main process
        // For testing, we'll use a direct fetch call that MSW will intercept
        const response = await fetch(`https://esi.evetech.net/latest/characters/${characterId}/skills/`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        setSkills(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch character skills');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacterSkills();
  }, [characterId]);

  if (loading) {
    return <div data-testid="loading">Loading character skills...</div>;
  }

  if (error) {
    return <div data-testid="error">Error: {error}</div>;
  }

  if (!skills) {
    return <div data-testid="no-data">No skill data available</div>;
  }

  return (
    <div data-testid="character-info">
      <h2>Character Skills</h2>
      <p>Total Skill Points: {skills.total_sp.toLocaleString()}</p>
      <p>Unallocated Skill Points: {skills.unallocated_sp.toLocaleString()}</p>
      
      <h3>Skills ({skills.skills.length})</h3>
      <ul>
        {skills.skills.map((skill) => (
          <li key={skill.skill_id}>
            Skill ID: {skill.skill_id} - Level: {skill.active_skill_level}
          </li>
        ))}
      </ul>
    </div>
  );
}; 