import express from 'express';
import { BrowserWindow } from 'electron';
import axios from 'axios';
import { URLSearchParams } from 'url';
import { AuthService } from './auth.service';

export class OAuthHandler {
  private server: express.Express;
  private readonly port = 5000; // As per the provided callback URL
  private authService: AuthService;
  private mainWindow: BrowserWindow;
  private authWindow: BrowserWindow | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.server = express();
    this.authService = new AuthService();
    this.mainWindow = mainWindow;
    this.setupRoutes();
  }

  public start() {
    this.server.listen(this.port, () => {
      console.log(`OAuth callback listener started on http://localhost:${this.port}`);
    });
  }

  private setupRoutes() {
    this.server.get('/callback', (req, res) => {
      const { code, state } = req.query;

      if (!code) {
        console.error('OAuth callback is missing authorization code.');
        res.status(400).send('Authentication failed: Missing authorization code.');
        // Optionally, notify the renderer process of the failure
        return;
      }

      // TODO: Subtask 28.1 - Validate state to prevent CSRF
      
      const authorizationCode = code as string;
      console.log(`Successfully extracted authorization code: ${authorizationCode}`);

      this.exchangeCodeForToken(authorizationCode);

      // TODO: Subtask 28.3, 28.4, 28.5 - Exchange code for token

      // In a real scenario, you would now exchange the code for a token,
      // then send the result to the renderer process.
      const window = BrowserWindow.getAllWindows()[0];
      if (window) {
          window.webContents.send('oauth-callback', { code: authorizationCode, state });
      }

      res.send('Authentication successful! You can close this window.');
    });
  }

  private async exchangeCodeForToken(code: string) {
    const EVE_AUTH_URL = 'https://login.eveonline.com/v2/oauth/token';
    const { EVE_CLIENT_ID, EVE_CLIENT_SECRET, EVE_CALLBACK_URL } = process.env;

    const authHeader = `Basic ${Buffer.from(`${EVE_CLIENT_ID}:${EVE_CLIENT_SECRET}`).toString('base64')}`;

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', EVE_CALLBACK_URL);
    
    try {
      const response = await axios.post(EVE_AUTH_URL, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': authHeader,
          'Host': 'login.eveonline.com',
        },
      });

      console.log('Token exchange successful');
      this.authService.storeTokens(response.data);
      this.mainWindow.webContents.send('login-success');
      if (this.authWindow) {
        this.authWindow.close();
      }

    } catch (error) {
      console.error('Error exchanging code for token:', error.response?.data || error.message);
    }
  }
} 