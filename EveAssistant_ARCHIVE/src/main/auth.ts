import { shell, ipcMain, app, BrowserWindow } from 'electron';
import crypto from 'crypto';
import axios from 'axios';
import url from 'url';
import keytar from 'keytar';

// --- Constants ---
const EVE_SSO_URL = 'https://login.eveonline.com/v2/oauth/authorize/';
const TOKEN_URL = 'https://login.eveonline.com/v2/oauth/token';
const CLIENT_ID = 'your_client_id_here'; // Replace with your actual Client ID
const CUSTOM_PROTOCOL = 'eve-assistant';
const CALLBACK_URL = `${CUSTOM_PROTOCOL}://callback`;
const SERVICE_NAME = 'EveAssistant';
const ACCOUNT_NAME = 'EVE_OAuth_Token';

let codeVerifier: string | null = null;
let mainWindow: BrowserWindow | null = null;

// --- Helper Functions ---
function base64URLEncode(str: Buffer): string {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function sha256(buffer: string): Buffer {
  return crypto.createHash('sha256').update(buffer).digest();
}

// --- Core Auth Logic ---
export function initializeAuth(win: BrowserWindow) {
  mainWindow = win;

  // Register the custom protocol
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL, process.execPath, [process.argv[1]]);
    }
  } else {
    app.setAsDefaultProtocolClient(CUSTOM_PROTOCOL);
  }

  app.on('open-url', (event, receivedUrl) => {
    event.preventDefault();
    handleAuthCallback(receivedUrl);
  });

  // Handle the callback on Windows when the app is already open
  app.on('second-instance', (event, commandLine) => {
    const receivedUrl = commandLine.pop();
    if (receivedUrl?.startsWith(`${CUSTOM_PROTOCOL}://`)) {
      handleAuthCallback(receivedUrl);
    }
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
  });
}

ipcMain.on('start-auth', () => {
  codeVerifier = base64URLEncode(crypto.randomBytes(32));
  const codeChallenge = base64URLEncode(sha256(codeVerifier));
  const state = crypto.randomBytes(16).toString('hex');

  const authUrl = new URL(EVE_SSO_URL);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', CALLBACK_URL);
  authUrl.searchParams.append('client_id', CLIENT_ID);
  authUrl.searchParams.append('scope', 'esi-skills.read_skillqueue.v1 esi-skills.read_skills.v1'); // Add needed scopes
  authUrl.searchParams.append('code_challenge', codeChallenge);
  authUrl.searchParams.append('code_challenge_method', 'S256');
  authUrl.searchParams.append('state', state);

  shell.openExternal(authUrl.toString());
});

ipcMain.handle('get-refresh-token', async () => {
  return await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
});

ipcMain.on('logout', async () => {
  await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
  mainWindow?.webContents.send('logged-out');
});

async function handleAuthCallback(receivedUrl: string) {
  const parsedUrl = new URL(receivedUrl);
  const authCode = parsedUrl.searchParams.get('code');
  // TODO: Validate state parameter

  if (authCode && codeVerifier) {
    try {
      const response = await axios.post(TOKEN_URL, new url.URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        client_id: CLIENT_ID,
        code_verifier: codeVerifier,
      }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, refresh_token } = response.data;
      
      // Securely store the refresh token
      await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, refresh_token);

      // We only need to send the access token to the renderer.
      // The refresh token will be retrieved from secure storage when needed.
      mainWindow?.webContents.send('auth-success', { access_token });

    } catch (error) {
      console.error('Error exchanging auth code for token:', error.response?.data || error.message);
      mainWindow?.webContents.send('auth-error', error.response?.data || error.message);
    }
  }
} 