import { ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  readClipboard: () => ipcRenderer.invoke('read-clipboard'),
  writeClipboard: (text: string) => ipcRenderer.invoke('write-clipboard', text),
  openFiles: () => ipcRenderer.invoke('open-files'),
}); 