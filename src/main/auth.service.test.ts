import { AuthService } from './auth.service';
import { server } from '../mocks';
import { http, HttpResponse } from 'msw';

// Mock electron-store with proper implementation
jest.mock('electron-store', () => {
  // Create a mock implementation of ElectronStore
  class MockStore {
    private data: Record<string, any> = {};
    
    get(key: string): any {
      return this.data[key];
    }
    
    set(key: string, value: any): void {
      this.data[key] = value;
    }
    
    delete(key: string): void {
      delete this.data[key];
    }
  }
  
  // Return the constructor function
  return jest.fn(() => new MockStore());
});

// Mock electron shell
jest.mock('electron', () => ({
  shell: {
    openExternal: jest.fn()
  }
}));

// Mock process.env
process.env.EVE_CLIENT_ID = 'mock-client-id';
process.env.EVE_CALLBACK_URL = 'http://localhost:5000/callback';

// Setup MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  jest.clearAllMocks();
});

// Close server after all tests
afterAll(() => {
  server.close();
});

describe('AuthService', () => {
  let authService: AuthService;
  
  beforeEach(() => {
    authService = new AuthService();
  });
  
  it('should exchange code for token', async () => {
    // Setup mock for code verifier
    const store = require('electron-store')();
    store.set('codeVerifier', 'mock-verifier');
    
    // Mock token exchange response
    server.use(
      http.post('https://login.eveonline.com/v2/oauth/token', () => {
        return HttpResponse.json({
          access_token: 'mock-access-token-123',
          refresh_token: 'mock-refresh-token-456',
          expires_in: 1200,
          token_type: 'Bearer'
        });
      })
    );
    
    await authService.exchangeCodeForToken('mock-auth-code');
    
    // Verify token was stored
    expect(store.get('accessToken')).toBe('mock-access-token-123');
    expect(store.get('refreshToken')).toBe('mock-refresh-token-456');
    expect(store.get('tokenExpires')).toBeGreaterThan(Date.now());
  });
  
  it('should refresh access token', async () => {
    // Setup mock for refresh token
    const store = require('electron-store')();
    store.set('refreshToken', 'mock-refresh-token');
    
    // Mock token refresh response
    server.use(
      http.post('https://login.eveonline.com/v2/oauth/token', () => {
        return HttpResponse.json({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 1200,
          token_type: 'Bearer'
        });
      })
    );
    
    const newToken = await authService.refreshAccessToken();
    
    // Verify token was refreshed and stored
    expect(newToken).toBe('new-access-token');
    expect(store.get('accessToken')).toBe('new-access-token');
    expect(store.get('refreshToken')).toBe('new-refresh-token');
    expect(store.get('tokenExpires')).toBeGreaterThan(Date.now());
  });
  
  it('should handle refresh token failure', async () => {
    // Setup mock for refresh token
    const store = require('electron-store')();
    store.set('refreshToken', 'invalid-refresh-token');
    
    // Mock token refresh error response
    server.use(
      http.post('https://login.eveonline.com/v2/oauth/token', () => {
        return new HttpResponse(null, {
          status: 400,
          statusText: 'Bad Request'
        });
      })
    );
    
    const newToken = await authService.refreshAccessToken();
    
    // Verify tokens were deleted
    expect(newToken).toBeNull();
    expect(store.get('accessToken')).toBeUndefined();
    expect(store.get('refreshToken')).toBeUndefined();
    expect(store.get('tokenExpires')).toBeUndefined();
  });
}); 