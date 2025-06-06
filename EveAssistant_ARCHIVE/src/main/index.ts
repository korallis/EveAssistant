import { app, BrowserWindow, ipcMain, protocol, shell } from 'electron';
import path from 'path';
import { DatabaseService } from './db/DatabaseService';
import { handleOAuth2 } from './auth';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  new DatabaseService();
  handleOAuth2();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Custom IPC handlers can be added here if needed in the future

// ipcMain.handle('read-clipboard', () => {
//   return clipboard.readText();
// });

// ipcMain.handle('write-clipboard', (_event, text) => {
//   clipboard.writeText(text);
// });

// ipcMain.handle('open-files', async () => {
//   const { filePaths } = await dialog.showOpenDialog({
//     properties: ['openFile', 'multiSelections'],
//   });
//   return filePaths;
// });

// ipcMain.handle('open-external-url', (_event, url) => {
//   shell.openExternal(url);
// });

// ... existing code ...

const isDevelopment = process.env.NODE_ENV !== 'production';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// ... existing code ...
protocol.registerFileProtocol('file', (request, callback) => {
  const url = request.url.substr(7);
  callback(decodeURI(path.normalize(url)));
});

// ... existing code ... 