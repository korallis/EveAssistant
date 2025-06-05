import { Attributes } from './attributes';

describe('Attributes', () => {
  let attributes: Attributes;

  beforeEach(() => {
    attributes = Attributes.getInstance();
    // Create a test map with attribute values
    const testMap = new Map<string, number>();
    testMap.set('cpuOutput', 100);
    testMap.set('powergridOutput', 1000);
    testMap.set('shieldCapacity', 500);
    testMap.set('armorHP', 300);
    testMap.set('hp', 200);
    testMap.set('maxVelocity', 250);
    testMap.set('mass', 12000000);
    testMap.set('agility', 0.65);
    attributes.setAttributes(testMap);
  });

  it('should return the same instance (singleton)', () => {
    const instance1 = Attributes.getInstance();
    const instance2 = Attributes.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should get attribute by name', () => {
    const cpuOutput = attributes.get('cpuOutput');
    expect(typeof cpuOutput).toBe('number');
    expect(cpuOutput).toBeGreaterThan(0);
  });

  it('should return undefined for unknown attribute', () => {
    const unknown = attributes.get('unknownAttribute');
    expect(unknown).toBeUndefined();
  });

  it('should have attributes we set', () => {
    // Test attributes we've initialized
    const testAttributes = [
      'cpuOutput',
      'powergridOutput',
      'shieldCapacity',
      'armorHP',
      'hp',
      'maxVelocity',
      'mass',
      'agility',
    ];

    testAttributes.forEach(attrName => {
      const attrId = attributes.get(attrName);
      expect(attrId).toBeDefined();
      expect(typeof attrId).toBe('number');
      expect(attrId).toBeGreaterThan(0);
    });
  });

  it('should handle case-sensitive attribute names', () => {
    const cpuOutput1 = attributes.get('cpuOutput');
    const cpuOutput2 = attributes.get('cpuoutput'); // lowercase
    expect(cpuOutput1).toBeDefined();
    expect(cpuOutput2).toBeUndefined();
  });
}); 