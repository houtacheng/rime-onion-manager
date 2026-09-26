const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  fetchVersions: () => ipcRenderer.invoke('fetch-versions'),
  listBackups: () => ipcRenderer.invoke('list-backups'),
  createBackup: (note) => ipcRenderer.invoke('create-backup', note),
  deployVersion: (versionData) => ipcRenderer.invoke('deploy-version', versionData),
  restoreBackup: (backupId) => ipcRenderer.invoke('restore-backup', backupId),
  reloadRime: () => ipcRenderer.invoke('reload-rime'),
  openRimeFolder: () => ipcRenderer.invoke('open-rime-folder'),
  selectLocalRepo: () => ipcRenderer.invoke('select-local-repo'),
  deployLocalRepo: (filePath) => ipcRenderer.invoke('deploy-local-repo', filePath),
  checkAppUpdate: () => ipcRenderer.invoke('check-app-update'),
  installAppUpdate: (asset) => ipcRenderer.invoke('install-app-update', asset),
  openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  exportTrimePackage: (data) => ipcRenderer.invoke('export-trime-package', data),
  openTrimeEditor: (options) => ipcRenderer.invoke('open-trime-editor', options),
  showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path),
  onLog: (callback) => {
    const listener = (_event, message) => callback(message);
    ipcRenderer.on('deploy-log', listener);
    return () => ipcRenderer.removeListener('deploy-log', listener);
  }
});
