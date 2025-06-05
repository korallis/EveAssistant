import { app, BrowserWindow, session, ipcMain } from 'electron';
import path from 'path';
import { OAuthHandler } from './oauth';
import dotenv from 'dotenv';
import { AuthService } from './auth.service';
import { DatabaseService } from './db/DatabaseService';
import { SdeService } from './sde/SdeService';
import { FittingDataService } from './services/FittingDataService';
import { attributeNames } from '../shared/attributes';
import { Attributes } from '../shared/Attributes';
import { DogmaEngine } from './dogma/DogmaEngine';

dotenv.config();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const authService = new AuthService();
  const oauthHandler = new OAuthHandler(mainWindow);
  oauthHandler.startServer();

  ipcMain.on('login', () => {
    console.log('Login message received, opening auth window.');
    oauthHandler.openAuthWindow();
  });

  ipcMain.on('check-login-status', (event) => {
    const tokens = authService.getTokens();
    if (tokens && !authService.isTokenExpired(tokens.tokenExpires)) {
      event.reply('login-status', true);
    } else {
      event.reply('login-status', false);
    }
  });

  ipcMain.on('download-sde', async () => {
    try {
      const sdeService = new SdeService(mainWindow);
      await sdeService.downloadSde();
      mainWindow.webContents.send('sde-download-complete');
    } catch (error) {
      mainWindow.webContents.send('sde-download-error', error.message);
    }
  });

  ipcMain.on('traverse-dogma-expression', async (event, expressionId) => {
    try {
      const dogmaEngine = DogmaEngine.getInstance();
      await dogmaEngine.traverseExpressionTree(expressionId);
    } catch (error) {
      console.error('Error traversing Dogma expression:', error);
    }
  });

  ipcMain.handle('get-modules', async () => {
    const dbService = DatabaseService.getInstance();
    return await dbService.getModules();
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  try {
    await DatabaseService.getInstance().initialize();
    console.log('Database service initialized successfully.');

    const fittingDataService = FittingDataService.getInstance();
    const attributeMap = new Map<string, number>();
    for (const name of attributeNames) {
      const id = await fittingDataService.getAttributeId(name);
      if (id) {
        attributeMap.set(name, id);
      }
    }
    Attributes.getInstance().setAttributes(attributeMap);
    console.log('Attributes initialized.');

  } catch (error) {
    console.error('Failed to initialize database service:', error);
  }

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["script-src 'self'"],
      },
    });
  });

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string; 