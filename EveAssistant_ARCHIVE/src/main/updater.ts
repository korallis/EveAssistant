import { autoUpdater } from 'electron-updater';
import { ipcMain, Notification } from 'electron';
import Store from 'electron-store';

const store = new Store();

export function setupUpdater(win: Electron.BrowserWindow) {
  autoUpdater.autoDownload = true;

  const channel = store.get('updateChannel', 'stable');
  autoUpdater.channel = channel as string;

  autoUpdater.on('update-available', () => {
    win.webContents.send('update-available');
    new Notification({
      title: 'Update Available',
      body: 'A new version of Eve Assistant is available. It will be downloaded in the background.',
    }).show();
  });

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-downloaded');
    new Notification({
      title: 'Update Downloaded',
      body: 'A new version of Eve Assistant has been downloaded. Restart the application to install.',
    }).show();
  });

  autoUpdater.on('error', (error) => {
    win.webContents.send('update-error', error);
    new Notification({
      title: 'Update Error',
      body: `An error occurred while updating: ${error.message}`,
    }).show();
  });

  ipcMain.on('check-for-updates', () => {
    autoUpdater.checkForUpdates();
  });

  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.on('set-update-channel', (event, channel) => {
    store.set('updateChannel', channel);
    autoUpdater.channel = channel;
  });

  ipcMain.on('get-update-channel', (event) => {
    event.reply('update-channel-reply', store.get('updateChannel', 'stable'));
  });
} 