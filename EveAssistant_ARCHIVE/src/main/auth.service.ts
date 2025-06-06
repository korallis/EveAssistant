import { shell } from 'electron';
import Store from 'electron-store';
import crypto from 'crypto';
import axios, { AxiosError } from 'axios';
import { URLSearchParams } from 'url';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenExpires: number;
}

interface AuthStoreData {
  codeVerifier?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpires?: number;
}

export class AuthService {
  private store: Store<AuthStoreData>;

  constructor() {
    this.store = new Store<AuthStoreData>({
      encryptionKey: 'a-very-secret-key-that-should-be-more-secure', // TODO: Use system keychain
    });
  }

  private generatePKCEChallenge(): { codeChallenge: string, codeVerifier: string } {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
    
    this.store.store.codeVerifier = verifier;

    return { codeChallenge: challenge, codeVerifier: verifier };
  }

  public initiateLogin(): void {
    const { codeChallenge } = this.generatePKCEChallenge();
    const scopes = [
      'esi-skills.read_skills.v1',
      'esi-universe.read_structures.v1',
      'esi-markets.read_character_orders.v1',
    ].join(' ');

    const callbackUrl = process.env.EVE_CALLBACK_URL || '';
    const clientId = process.env.EVE_CLIENT_ID || '';

    const authUrl =
      `https://login.eveonline.com/v2/oauth/authorize?` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
      `client_id=${clientId}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`;

    shell.openExternal(authUrl);
  }

  public async exchangeCodeForToken(code: string): Promise<void> {
    try {
      const codeVerifier = this.store.store.codeVerifier;
      if (!codeVerifier) {
        throw new Error('Code verifier not found');
      }

      const response = await axios.post(
        'https://login.eveonline.com/v2/oauth/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: process.env.EVE_CLIENT_ID || '',
          code_verifier: codeVerifier,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Host: 'login.eveonline.com',
          },
        }
      );

      this.storeTokens(response.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error exchanging code for token:', 
        axiosError.response?.data || axiosError.message || String(error));
      throw error;
    }
  }

  public getTokens(): AuthTokens | null {
    const accessToken = this.store.store.accessToken;
    const refreshToken = this.store.store.refreshToken;
    const tokenExpires = this.store.store.tokenExpires;

    if (accessToken && refreshToken && tokenExpires) {
      return { 
        accessToken, 
        refreshToken, 
        tokenExpires 
      };
    }
    return null;
  }

  public storeTokens(tokens: { access_token: string; refresh_token: string; expires_in: number }) {
    this.store.store = {
      ...this.store.store,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpires: Date.now() + tokens.expires_in * 1000
    };
    console.log('Tokens stored securely.');
  }

  public async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.store.store.refreshToken;
    if (!refreshToken) {
      console.error('No refresh token available.');
      return null;
    }

    try {
      const response = await axios.post(
        'https://login.eveonline.com/v2/oauth/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.EVE_CLIENT_ID || '',
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Host: 'login.eveonline.com',
          },
        }
      );

      this.storeTokens(response.data);
      return response.data.access_token;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error refreshing token:', 
        axiosError.response?.data || axiosError.message || String(error));
      this.store.store = {
        ...this.store.store,
        accessToken: undefined,
        refreshToken: undefined,
        tokenExpires: undefined
      };
      return null;
    }
  }
} 