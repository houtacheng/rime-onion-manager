import { SystemInfo, RemoteVersion, BackupItem, DeployResult, AppUpdateInfo, TrimeExportResult, TrimeExportOptions } from './types';

declare global {
  interface Window {
    electronAPI?: {
      getSystemInfo: () => Promise<SystemInfo>;
      fetchVersions: () => Promise<RemoteVersion[]>;
      listBackups: () => Promise<BackupItem[]>;
      createBackup: (note: string) => Promise<BackupItem>;
      deployVersion: (versionData: { sha: string; title: string }) => Promise<DeployResult>;
      restoreBackup: (backupId: string) => Promise<{ success: boolean }>;
      reloadRime: () => Promise<{ success: boolean; output: string }>;
      openRimeFolder: () => Promise<string>;
      selectLocalRepo: () => Promise<{ canceled: boolean; filePaths: string[] }>;
      deployLocalRepo: (filePath: string) => Promise<DeployResult>;
      checkAppUpdate: () => Promise<AppUpdateInfo>;
      installAppUpdate: (asset: { name: string; url: string; size?: number }) => Promise<{ success: boolean; message?: string }>;
      openExternalUrl: (url: string) => Promise<{ success: boolean }>;
      showSaveDialog: (options: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<{ canceled: boolean; filePath?: string }>;
      exportTrimePackage: (options: TrimeExportOptions) => Promise<TrimeExportResult>;
      openTrimeEditor: (options?: { zipPath?: string }) => Promise<{ success: boolean; error?: string; opened?: string }>;
      showItemInFolder: (path: string) => Promise<{ success: boolean }>;
      onLog: (callback: (msg: string) => void) => () => void;
    };
  }
}

const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI);
const API_BASE = 'http://localhost:5174/api';

export const api = {
  async getSystemInfo(): Promise<SystemInfo> {
    if (isElectron) {
      return await window.electronAPI!.getSystemInfo();
    }
    const res = await fetch(`${API_BASE}/system-info`);
    return await res.json();
  },

  async fetchVersions(): Promise<RemoteVersion[]> {
    if (isElectron) {
      return await window.electronAPI!.fetchVersions();
    }
    const res = await fetch(`${API_BASE}/versions`);
    return await res.json();
  },

  async listBackups(): Promise<BackupItem[]> {
    if (isElectron) {
      return await window.electronAPI!.listBackups();
    }
    const res = await fetch(`${API_BASE}/backups`);
    return await res.json();
  },

  async createBackup(note: string): Promise<BackupItem> {
    if (isElectron) {
      return await window.electronAPI!.createBackup(note);
    }
    const res = await fetch(`${API_BASE}/create-backup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note })
    });
    return await res.json();
  },

  async deployVersion(
    versionData: { sha: string; title: string },
    onLog?: (msg: string) => void
  ): Promise<DeployResult> {
    if (isElectron) {
      let cleanup: (() => void) | undefined;
      if (onLog) {
        cleanup = window.electronAPI!.onLog(onLog);
      }
      try {
        return await window.electronAPI!.deployVersion(versionData);
      } finally {
        cleanup?.();
      }
    }
    const res = await fetch(`${API_BASE}/deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(versionData)
    });
    const data = await res.json();
    if (data.logs && onLog) {
      data.logs.forEach(onLog);
    }
    return data;
  },

  async restoreBackup(
    backupId: string,
    onLog?: (msg: string) => void
  ): Promise<{ success: boolean }> {
    if (isElectron) {
      let cleanup: (() => void) | undefined;
      if (onLog) {
        cleanup = window.electronAPI!.onLog(onLog);
      }
      try {
        return await window.electronAPI!.restoreBackup(backupId);
      } finally {
        cleanup?.();
      }
    }
    const res = await fetch(`${API_BASE}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backupId })
    });
    const data = await res.json();
    if (data.logs && onLog) {
      data.logs.forEach(onLog);
    }
    return data;
  },

  async reloadRime(): Promise<{ success: boolean; output: string }> {
    if (isElectron) {
      return await window.electronAPI!.reloadRime();
    }
    const res = await fetch(`${API_BASE}/reload`, { method: 'POST' });
    return await res.json();
  },

  async openRimeFolder(): Promise<void> {
    if (isElectron) {
      await window.electronAPI!.openRimeFolder();
      return;
    }
    await fetch(`${API_BASE}/open-folder`, { method: 'POST' });
  },

  async selectLocalRepo(): Promise<{ canceled: boolean; filePaths: string[] }> {
    if (isElectron && window.electronAPI?.selectLocalRepo) {
      return await window.electronAPI.selectLocalRepo();
    }
    return { canceled: true, filePaths: [] };
  },

  async deployLocalRepo(filePath: string, onLog?: (msg: string) => void): Promise<DeployResult> {
    if (isElectron && window.electronAPI?.deployLocalRepo) {
      let cleanup: (() => void) | undefined;
      if (onLog) {
        cleanup = window.electronAPI.onLog(onLog);
      }
      try {
        return await window.electronAPI.deployLocalRepo(filePath);
      } finally {
        cleanup?.();
      }
    }
    const res = await fetch(`${API_BASE}/deploy-local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath })
    });
    const data = await res.json();
    if (data.logs && onLog) {
      data.logs.forEach(onLog);
    }
    return data;
  },

  async checkAppUpdate(): Promise<AppUpdateInfo> {
    if (isElectron && window.electronAPI?.checkAppUpdate) {
      return await window.electronAPI.checkAppUpdate();
    }
    const res = await fetch(`${API_BASE}/check-app-update`);
    return await res.json();
  },

  async installAppUpdate(
    asset: { name: string; url: string; size?: number },
    onLog?: (msg: string) => void
  ): Promise<{ success: boolean; message?: string }> {
    if (isElectron && window.electronAPI?.installAppUpdate) {
      let cleanup: (() => void) | undefined;
      if (onLog) {
        cleanup = window.electronAPI.onLog(onLog);
      }
      try {
        return await window.electronAPI.installAppUpdate(asset);
      } finally {
        cleanup?.();
      }
    }
    const res = await fetch(`${API_BASE}/install-app-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset })
    });
    const data = await res.json();
    if (data.logs && onLog) {
      data.logs.forEach(onLog);
    }
    return data;
  },

  async openExternal(url: string): Promise<void> {
    if (isElectron && window.electronAPI?.openExternalUrl) {
      await window.electronAPI.openExternalUrl(url);
      return;
    }
    await fetch(`${API_BASE}/open-external`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
  },

  async showSaveDialog(options: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }): Promise<{ canceled: boolean; filePath?: string }> {
    if (isElectron && window.electronAPI?.showSaveDialog) {
      return await window.electronAPI.showSaveDialog(options);
    }
    return { canceled: true };
  },

  async exportTrimePackage(
    options: TrimeExportOptions,
    onLog?: (msg: string) => void
  ): Promise<TrimeExportResult> {
    if (isElectron && window.electronAPI?.exportTrimePackage) {
      let cleanup: (() => void) | undefined;
      if (onLog) {
        cleanup = window.electronAPI!.onLog(onLog);
      }
      try {
        return await window.electronAPI.exportTrimePackage(options);
      } finally {
        cleanup?.();
      }
    }
    const res = await fetch(`${API_BASE}/export-trime-package`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    const data = await res.json();
    if (data.logs && onLog) {
      data.logs.forEach(onLog);
    }
    return data;
  },

  async showItemInFolder(path: string): Promise<void> {
    if (isElectron && window.electronAPI?.showItemInFolder) {
      await window.electronAPI.showItemInFolder(path);
    }
  },

  async openTrimeEditor(options?: { zipPath?: string }): Promise<{ success: boolean; error?: string; opened?: string }> {
    if (isElectron && window.electronAPI?.openTrimeEditor) {
      return await window.electronAPI.openTrimeEditor(options);
    }
    const res = await fetch(`${API_BASE}/open-trime-editor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options || {})
    });
    return await res.json();
  }
};
