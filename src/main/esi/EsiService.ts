import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthService } from '../auth.service';
import pLimit from 'p-limit';
import NodeCache from 'node-cache';
import { EsiSkills } from './types';
import axiosRetry from 'axios-retry';

export class EsiService {
  private apiClient: AxiosInstance;
  private authService: AuthService;
  private limit = pLimit(20); // ESI rate limit is 20 requests/second
  private cache = new NodeCache();

  constructor() {
    this.authService = new AuthService();
    this.apiClient = axios.create({
      baseURL: 'https://esi.evetech.net/latest',
    });

    axiosRetry(this.apiClient, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
    });

    this.apiClient.interceptors.request.use(
      async (config) => {
        let tokens = this.authService.getTokens();
        if (tokens && Date.now() >= tokens.tokenExpires) {
          const newAccessToken = await this.authService.refreshAccessToken();
          if (newAccessToken) {
            tokens = { ...tokens, accessToken: newAccessToken };
          } else {
            // Handle failed refresh
            return Promise.reject(new Error('Token refresh failed'));
          }
        }
        if (tokens) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error(`ESI Error: ${error.response.status} - ${error.response.data?.error}`);
        } else if (error.request) {
          console.error('ESI Error: No response received');
        } else {
          console.error('ESI Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const cachedResponse = this.cache.get<T>(url);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await this.limit(() => this.apiClient.get<T>(url, config));
    
    const expires = response.headers['expires'];
    if (expires) {
      const ttl = (new Date(expires).getTime() - Date.now()) / 1000;
      this.cache.set(url, response.data, ttl);
    }

    return response.data;
  }

  public async getCharacterSkills(characterId: number): Promise<EsiSkills> {
    const url = `/characters/${characterId}/skills/`;
    return this.get<EsiSkills>(url);
  }

  // Add methods for specific ESI endpoints here
} 