import { SystemInfo, RemoteVersion, BackupItem, DeployResult } from './types';

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
  }
};
