export interface SystemInfo {
  platform: string;
  rimeDir: string;
  dirExists: boolean;
  installedSha: string | null;
  installedMessage: string | null;
  installedDate: string | null;
  appVersion?: string;
}

export interface AppUpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseUrl?: string;
  releaseName?: string;
  releaseNotes?: string;
  publishedAt?: string;
  downloadAsset?: {
    name: string;
    url: string;
    size: number;
  };
  error?: string;
  message?: string;
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

export type TrimeLayoutType = 'samsung' | 'standard' | 'qwerty';

export interface TrimeExportOptions {
  layoutType: TrimeLayoutType;
  targetZipPath?: string;
  versionSha?: string;
  versionTitle?: string;
  openInEditor?: boolean;
}

export interface TrimeExportResult {
  success: boolean;
  zipPath?: string;
  zipName?: string;
  sizeMB?: string;
  layoutType?: TrimeLayoutType;
  stagingZipPath?: string | null;
  editorUrl?: string;
  error?: string;
  logs?: string[];
}
