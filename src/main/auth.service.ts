import { shell } from 'electron';
import Store from 'electron-store';
import crypto from 'crypto';
import axios from 'axios';
import { URLSearchParams } from 'url';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenExpires: number;
}

export class AuthService {
  private store: Store;
  private codeVerifier?: string;

  constructor() {
    this.store = new Store({
      encryptionKey: 'a-very-secret-key-that-should-be-more-secure', // TODO: Use system keychain
    });
  }

  private generatePKCEChallenge(): { codeChallenge: string, codeVerifier: string } {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
    
    this.codeVerifier = verifier;
    this.store.set('codeVerifier', verifier);

    return { codeChallenge: challenge, codeVerifier: verifier };
  }

  public initiateLogin(): void {
    const { codeChallenge } = this.generatePKCEChallenge();
    const scopes = [
      'esi-skills.read_skills.v1',
      'esi-universe.read_structures.v1',
      'esi-markets.read_character_orders.v1',
    ].join(' ');

    const authUrl =
      `https://login.eveonline.com/v2/oauth/authorize?` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(process.env.EVE_CALLBACK_URL)}&` +
      `client_id=${process.env.EVE_CLIENT_ID}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`;

    shell.openExternal(authUrl);
  }

  public async exchangeCodeForToken(code: string): Promise<void> {
    try {
      const response = await axios.post(
        'https://login.eveonline.com/v2/oauth/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: process.env.EVE_CLIENT_ID,
          code_verifier: this.store.get('codeVerifier') as string,
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
      console.error('Error exchanging code for token:', error.response?.data || error.message);
      throw error;
    }
  }

  public getTokens(): AuthTokens | null {
    const accessToken = this.store.get('accessToken') as string;
    const refreshToken = this.store.get('refreshToken') as string;
    const tokenExpires = this.store.get('tokenExpires') as number;

    if (accessToken && refreshToken && tokenExpires) {
      return { accessToken, refreshToken, tokenExpires };
    }
    return null;
  }

  public storeTokens(tokens: { access_token: string; refresh_token: string; expires_in: number }) {
    this.store.set('accessToken', tokens.access_token);
    this.store.set('refreshToken', tokens.refresh_token);
    this.store.set('tokenExpires', Date.now() + tokens.expires_in * 1000);
    console.log('Tokens stored securely.');
  }

  public async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.store.get('refreshToken') as string;
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
          client_id: process.env.EVE_CLIENT_ID,
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
      console.error('Error refreshing token:', error.response?.data || error.message);
      this.store.delete('accessToken');
      this.store.delete('refreshToken');
      this.store.delete('tokenExpires');
      return null;
    }
  }
} 