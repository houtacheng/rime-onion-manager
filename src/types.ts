export interface SystemInfo {
  platform: string;
  rimeDir: string;
  dirExists: boolean;
  installedSha: string | null;
  installedMessage: string | null;
  installedDate: string | null;
}

export interface RemoteVersion {
  id: string;
  sha: string;
  shortSha: string;
  title: string;
  body?: string;
  date: string;
  author?: string;
  isRelease: boolean;
  downloadUrl: string;
}

export interface BackupItem {
  id: string;
  date: string;
  note: string;
  fromSha: string | null;
}

export interface DeployResult {
  success: boolean;
  installedSha?: string;
  error?: string;
  logs?: string[];
}
