const { contextBridge, ipcRenderer } = require('electron');
const { CommonFitService } = require('./services/CommonFitService');

contextBridge.exposeInMainWorld('dogma', {
  traverseExpression: (expressionId) => ipcRenderer.send('traverse-dogma-expression', expressionId),
  getModules: () => ipcRenderer.invoke('get-modules'),
});

contextBridge.exposeInMainWorld('fittings', {
  getAll: () => new CommonFitService().getAllFits(),
  getById: (id) => new CommonFitService().getFitById(id),
  save: (fit) => new CommonFitService().saveFit(fit),
  delete: (id) => new CommonFitService().deleteFit(id),
}); 