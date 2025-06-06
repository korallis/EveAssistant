import { EsiService } from './EsiService';
import { server } from '../../mocks';
import { http, HttpResponse } from 'msw';

// Mock the AuthService
jest.mock('../auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => ({
      getTokens: jest.fn().mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        tokenExpires: Date.now() + 3600000 // Expires in 1 hour
      }),
      refreshAccessToken: jest.fn().mockResolvedValue('new-mock-access-token')
    }))
  };
});

// Setup MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});

describe('EsiService', () => {
  let esiService: EsiService;

  beforeEach(() => {
    esiService = new EsiService();
  });

  it('should get character skills', async () => {
    // Mock the specific endpoint for this test
    server.use(
      http.get('https://esi.evetech.net/latest/characters/:characterId/skills/', () => {
        return HttpResponse.json({
          skills: [
            { skill_id: 1234, active_skill_level: 5, trained_skill_level: 5 },
            { skill_id: 5678, active_skill_level: 4, trained_skill_level: 4 }
          ],
          total_sp: 10000000,
          unallocated_sp: 5000
        });
      })
    );

    const characterId = 12345678;
    const skills = await esiService.getCharacterSkills(characterId);

    expect(skills).toBeDefined();
    expect(skills.skills).toHaveLength(2);
    expect(skills.skills[0].skill_id).toBe(1234);
    expect(skills.skills[0].active_skill_level).toBe(5);
    expect(skills.total_sp).toBe(10000000);
  });

  it('should handle error responses', async () => {
    // Mock an error response
    server.use(
      http.get('https://esi.evetech.net/latest/characters/:characterId/skills/', () => {
        return new HttpResponse(null, {
          status: 403,
          statusText: 'Forbidden'
        });
      })
    );

    const characterId = 12345678;
    
    await expect(esiService.getCharacterSkills(characterId)).rejects.toThrow();
  });
}); 