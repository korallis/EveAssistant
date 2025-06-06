import { DamageProfile } from './DamageProfile';

describe('DamageProfile', () => {
  it('should create a damage profile with specified values', () => {
    const profile = new DamageProfile(0.25, 0.3, 0.35, 0.1);
    expect(profile.em).toBe(0.25);
    expect(profile.thermal).toBe(0.3);
    expect(profile.kinetic).toBe(0.35);
    expect(profile.explosive).toBe(0.1);
  });

  it('should create a balanced damage profile', () => {
    const profile = new DamageProfile(0.25, 0.25, 0.25, 0.25);
    expect(profile.em).toBe(0.25);
    expect(profile.thermal).toBe(0.25);
    expect(profile.kinetic).toBe(0.25);
    expect(profile.explosive).toBe(0.25);
  });

  it('should handle edge case values', () => {
    const profile = new DamageProfile(0, 0, 0, 1);
    expect(profile.em).toBe(0);
    expect(profile.thermal).toBe(0);
    expect(profile.kinetic).toBe(0);
    expect(profile.explosive).toBe(1);
  });

  it('should work with high precision values', () => {
    const profile = new DamageProfile(0.333333, 0.222222, 0.111111, 0.333334);
    expect(profile.em).toBeCloseTo(0.333333);
    expect(profile.thermal).toBeCloseTo(0.222222);
    expect(profile.kinetic).toBeCloseTo(0.111111);
    expect(profile.explosive).toBeCloseTo(0.333334);
  });
}); 