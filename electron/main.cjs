const { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const rimeService = require('./rime-service.cjs');

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 780,
    height: 820,
    minWidth: 620,
    minHeight: 650,
    title: '洋蔥注音 Rime 設定管理器',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    },
    backgroundColor: '#020617',
    show: false
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupTray() {
  // Simple tray setup
  try {
    const icon = nativeImage.createEmpty();
    tray = new Tray(icon);
    tray.setToolTip('洋蔥注音 Rime 管理器');
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '開啟管理介面',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          } else {
            createWindow();
          }
        }
      },
      {
        label: '立即重新部署 (Reload)',
        click: async () => {
          await rimeService.reloadRime();
        }
      },
      {
        label: '開啟 Rime 設定資料夾',
        click: () => {
          shell.openPath(rimeService.getRimeDir());
        }
      },
      { type: 'separator' },
      { label: '結束', click: () => app.quit() }
    ]);
    tray.setContextMenu(contextMenu);
  } catch (e) {
    // tray creation optional in dev
  }
}

// IPC Handlers
ipcMain.handle('get-system-info', async () => {
  return await rimeService.getSystemInfo();
});

ipcMain.handle('fetch-versions', async () => {
  return await rimeService.fetchRemoteVersions();
});

ipcMain.handle('list-backups', async () => {
  return await rimeService.listBackups();
});

ipcMain.handle('create-backup', async (_event, note) => {
  return await rimeService.createBackup(note);
});

ipcMain.handle('deploy-version', async (event, versionData) => {
  const logCallback = (msg) => {
    event.sender.send('deploy-log', msg);
  };
  return await rimeService.deployVersion({
    sha: versionData.sha,
    title: versionData.title,
    logCallback
  });
});

ipcMain.handle('restore-backup', async (event, backupId) => {
  const logCallback = (msg) => {
    event.sender.send('deploy-log', msg);
  };
  return await rimeService.restoreBackup(backupId, logCallback);
});

ipcMain.handle('reload-rime', async () => {
  return await rimeService.reloadRime();
});

ipcMain.handle('open-rime-folder', async () => {
  const dir = rimeService.getRimeDir();
  return await shell.openPath(dir);
});

app.whenReady().then(() => {
  createWindow();
  setupTray();

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
