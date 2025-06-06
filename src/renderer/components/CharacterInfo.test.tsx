import { render, screen, waitFor } from '@testing-library/react';
import { CharacterInfo } from './CharacterInfo';
import { server } from '../../mocks';
import { http, HttpResponse } from 'msw';

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

describe('CharacterInfo Component', () => {
  const characterId = 12345678;

  it('should show loading state initially', () => {
    // Setup default mock response with delay to ensure we see loading state
    server.use(
      http.get(`https://esi.evetech.net/latest/characters/:characterId/skills/`, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json({
          skills: [],
          total_sp: 0,
          unallocated_sp: 0
        });
      })
    );

    render(<CharacterInfo characterId={characterId} />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should display character skills when data loads successfully', async () => {
    // Setup mock response
    server.use(
      http.get(`https://esi.evetech.net/latest/characters/:characterId/skills/`, () => {
        return HttpResponse.json({
          skills: [
            { skill_id: 3300, active_skill_level: 4, trained_skill_level: 4 },
            { skill_id: 3301, active_skill_level: 3, trained_skill_level: 3 }
          ],
          total_sp: 5500000,
          unallocated_sp: 10000
        });
      })
    );

    render(<CharacterInfo characterId={characterId} />);
    
    // Wait for the skills to load
    await waitFor(() => {
      expect(screen.getByTestId('character-info')).toBeInTheDocument();
    });
    
    // Verify skill data is displayed
    expect(screen.getByText('Total Skill Points: 5,500,000')).toBeInTheDocument();
    expect(screen.getByText('Unallocated Skill Points: 10,000')).toBeInTheDocument();
    expect(screen.getByText('Skills (2)')).toBeInTheDocument();
    expect(screen.getByText(/Skill ID: 3300 - Level: 4/)).toBeInTheDocument();
    expect(screen.getByText(/Skill ID: 3301 - Level: 3/)).toBeInTheDocument();
  });

  it('should display error message when API call fails', async () => {
    // Setup error response
    server.use(
      http.get(`https://esi.evetech.net/latest/characters/:characterId/skills/`, () => {
        return new HttpResponse(null, {
          status: 403,
          statusText: 'Forbidden'
        });
      })
    );

    render(<CharacterInfo characterId={characterId} />);
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Error: API error: 403/)).toBeInTheDocument();
  });
}); 