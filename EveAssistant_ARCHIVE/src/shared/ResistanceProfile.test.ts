import { ResistanceProfile } from './ResistanceProfile';

describe('ResistanceProfile', () => {
  it('should create a resistance profile with specified values', () => {
    const profile = new ResistanceProfile(0.2, 0.3, 0.4, 0.5);
    expect(profile.em).toBe(0.2);
    expect(profile.thermal).toBe(0.3);
    expect(profile.kinetic).toBe(0.4);
    expect(profile.explosive).toBe(0.5);
  });

  it('should create a zero resistance profile', () => {
    const profile = new ResistanceProfile(0, 0, 0, 0);
    expect(profile.em).toBe(0);
    expect(profile.thermal).toBe(0);
    expect(profile.kinetic).toBe(0);
    expect(profile.explosive).toBe(0);
  });

  it('should handle high resistance values', () => {
    const profile = new ResistanceProfile(0.9, 0.95, 0.8, 0.85);
    expect(profile.em).toBe(0.9);
    expect(profile.thermal).toBe(0.95);
    expect(profile.kinetic).toBe(0.8);
    expect(profile.explosive).toBe(0.85);
  });

  it('should handle negative resistance values', () => {
    const profile = new ResistanceProfile(-0.1, -0.2, 0.3, 0.4);
    expect(profile.em).toBe(-0.1);
    expect(profile.thermal).toBe(-0.2);
    expect(profile.kinetic).toBe(0.3);
    expect(profile.explosive).toBe(0.4);
  });

  it('should work with high precision values', () => {
    const profile = new ResistanceProfile(0.123456, 0.789012, 0.345678, 0.901234);
    expect(profile.em).toBeCloseTo(0.123456);
    expect(profile.thermal).toBeCloseTo(0.789012);
    expect(profile.kinetic).toBeCloseTo(0.345678);
    expect(profile.explosive).toBeCloseTo(0.901234);
  });
}); 