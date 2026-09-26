const { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage, Notification, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const rimeService = require('./rime-service.cjs');

let mainWindow = null;
let editorWindow = null;
let tray = null;
let isQuitting = false;

// Ensure single instance lock so multiple copies don't open
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 780,
    height: 820,
    minWidth: 620,
    minHeight: 650,
    title: '洋蔥注音 Rime 設定管理器',
    icon: path.join(__dirname, '../build/icon.ico'),
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
    // Check if launched with --hidden
    const startHidden = process.argv.includes('--hidden') || app.getLoginItemSettings().wasOpenedAsHidden;
    if (!startHidden) {
      mainWindow.show();
    }
  });

  // 常駐系統列：點擊視窗關閉 (X) 時隱藏至托盤而非直接退出
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();

      // Show notification on Windows
      if (Notification.isSupported()) {
        new Notification({
          title: '洋蔥注音管理器',
          body: '程式已最小化至系統列常駐。雙擊系統列圖示可隨時喚醒。',
          icon: path.join(__dirname, '../assets/tray.png')
        }).show();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupTray() {
  try {
    let iconPath = path.join(__dirname, '../assets/tray.png');
    if (process.platform === 'win32') {
      iconPath = path.join(__dirname, '../build/icon.ico');
    }

    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon);
    tray.setToolTip('洋蔥注音 Rime 管理器 (常駐中)');

    const updateContextMenu = () => {
      const isAutoStart = app.getLoginItemSettings().openAtLogin;

      const contextMenu = Menu.buildFromTemplate([
        {
          label: '🧅 洋蔥注音 Rime 管理器',
          enabled: false
        },
        { type: 'separator' },
        {
          label: '開啟管理視窗',
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
          label: '⚡ 快速重新部署輸入法',
          click: async () => {
            const res = await rimeService.reloadRime();
            if (Notification.isSupported()) {
              new Notification({
                title: 'Rime 輸入法',
                body: res.output || (res.success ? '重新部署成功！' : '請手動重新部署')
              }).show();
            }
          }
        },
        {
          label: '📂 開啟 Rime 設定資料夾',
          click: () => {
            shell.openPath(rimeService.getRimeDir());
          }
        },
        {
          label: '🔄 檢查管理器新版本...',
          click: async () => {
            const updateInfo = await rimeService.checkAppUpdate();
            if (Notification.isSupported()) {
              if (updateInfo.hasUpdate) {
                new Notification({
                  title: '發現新版本！',
                  body: `洋蔥注音管理器有新版本 ${updateInfo.latestVersion} 可用！`
                }).show();
              } else if (updateInfo.error) {
                new Notification({
                  title: '檢查更新失敗',
                  body: updateInfo.error
                }).show();
              } else {
                new Notification({
                  title: '洋蔥注音管理器',
                  body: `目前已是最新版本 (v${updateInfo.currentVersion})。`
                }).show();
              }
            }
            if (updateInfo.hasUpdate && mainWindow) {
              mainWindow.show();
              mainWindow.focus();
            }
          }
        },
        { type: 'separator' },
        {
          label: '開機自動啟動 (常駐系統列)',
          type: 'checkbox',
          checked: isAutoStart,
          click: (menuItem) => {
            app.setLoginItemSettings({
              openAtLogin: menuItem.checked,
              openAsHidden: true,
              args: ['--hidden']
            });
            updateContextMenu();
          }
        },
        { type: 'separator' },
        {
          label: '完全結束程式',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]);

      tray.setContextMenu(contextMenu);
    };

    updateContextMenu();

    // 點擊/雙擊托盤圖示直接展開主視窗
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.focus();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });

    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (err) {
    console.error('Tray initialization error:', err);
  }
}

// 預設啟用開機常駐 (Windows / macOS)
function initAutoStart() {
  try {
    const settings = app.getLoginItemSettings();
    if (!settings.openAtLogin) {
      app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true,
        args: ['--hidden']
      });
    }
  } catch (e) {
    console.error('Failed to set login item:', e);
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

ipcMain.handle('select-local-repo', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '選擇下載的洋蔥注音 REPO (ZIP 壓縮檔或資料夾)',
    properties: ['openFile', 'openDirectory'],
    filters: [
      { name: 'ZIP 壓縮包或所有檔案', extensions: ['zip'] },
      { name: '所有檔案', extensions: ['*'] }
    ]
  });
  return result;
});

ipcMain.handle('deploy-local-repo', async (event, filePath) => {
  const logCallback = (msg) => {
    event.sender.send('deploy-log', msg);
  };
  return await rimeService.deployFromLocal({
    sourcePath: filePath,
    logCallback
  });
});

ipcMain.handle('check-app-update', async () => {
  return await rimeService.checkAppUpdate();
});

ipcMain.handle('install-app-update', async (event, asset) => {
  const logCallback = (msg) => {
    event.sender.send('deploy-log', msg);
  };
  return await rimeService.downloadAndInstallAppUpdate({
    asset,
    logCallback,
    onBeforeQuit: () => {
      isQuitting = true;
      setTimeout(() => {
        app.quit();
      }, 1000);
    }
  });
});

ipcMain.handle('open-external-url', async (_event, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    await shell.openExternal(url);
    return { success: true };
  }
  return { success: false, error: 'Invalid URL' };
});

ipcMain.handle('show-save-dialog', async (_event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('export-trime-package', async (event, data) => {
  const logCallback = (msg) => {
    event.sender.send('deploy-log', msg);
  };
  return await rimeService.exportTrimePackage({
    layoutType: data?.layoutType || 'standard',
    targetZipPath: data?.targetZipPath,
    versionSha: data?.versionSha,
    versionTitle: data?.versionTitle,
    logCallback
  });
});

ipcMain.handle('show-item-in-folder', async (_event, filePath) => {
  if (filePath) {
    shell.showItemInFolder(filePath);
  }
  return { success: true };
});

ipcMain.handle('open-trime-editor', async (_event, options) => {
  const editorDir = rimeService.getTrimeEditorDir();
  const indexPath = path.join(editorDir, 'index.html');

  if (!fs.existsSync(indexPath)) {
    return { success: false, error: `找不到 Trime 編輯器: ${indexPath}` };
  }

  const editorUrl = `file://${indexPath}?auto=1&t=${Date.now()}`;

  if (editorWindow && !editorWindow.isDestroyed()) {
    if (editorWindow.isMinimized()) editorWindow.restore();
    editorWindow.show();
    editorWindow.focus();
    editorWindow.loadURL(editorUrl);
    return { success: true, opened: 'existing' };
  }

  editorWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 650,
    title: '🎹 Trime 鍵盤佈局編輯器 (洋蔥注音整合版)',
    icon: path.join(__dirname, '../build/icon.ico'),
    backgroundColor: '#1a1d23',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // 允許載入本機暫存 ZIP
    }
  });

  editorWindow.loadURL(editorUrl);

  editorWindow.on('closed', () => {
    editorWindow = null;
  });

  return { success: true, opened: 'new' };
});

app.whenReady().then(() => {
  initAutoStart();
  createWindow();
  setupTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  // 保持常駐在托盤，不退出
});
