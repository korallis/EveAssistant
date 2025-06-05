const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dogma', {
  traverseExpression: (expressionId) => ipcRenderer.send('traverse-dogma-expression', expressionId),
  getModules: () => ipcRenderer.invoke('get-modules'),
}); 