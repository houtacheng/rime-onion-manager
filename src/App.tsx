import React, { useState, useEffect } from 'react';
import { api } from './api';
import { SystemInfo, RemoteVersion, BackupItem, AppUpdateInfo } from './types';
import { Header } from './components/Header';
import { StatusCard } from './components/StatusCard';
import { UpdateCard } from './components/UpdateCard';
import { HistorySection } from './components/HistorySection';
import { BackupSection } from './components/BackupSection';
import { LogModal } from './components/LogModal';
import { TrimeExportCard } from './components/TrimeExportCard';
import { AndroidExportModal } from './components/AndroidExportModal';
import { FolderArchive, UploadCloud, Sparkles, ExternalLink, X, DownloadCloud } from 'lucide-react';

export const App: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [versions, setVersions] = useState<RemoteVersion[]>([]);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // App self-update states
  const [appUpdate, setAppUpdate] = useState<AppUpdateInfo | null>(null);
  const [checkingAppUpdate, setCheckingAppUpdate] = useState(false);
  const [dismissedUpdate, setDismissedUpdate] = useState(false);
  const [updatingApp, setUpdatingApp] = useState(false);

  // Log modal state
  const [logs, setLogs] = useState<string[]>([]);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logModalTitle, setLogModalTitle] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  // Android / Trime export modal state
  const [androidModalOpen, setAndroidModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'history' | 'backups'>('history');

  const loadData = async () => {
    try {
      setLoading(true);
      setNetworkError(null);
      const [info, bks] = await Promise.all([
        api.getSystemInfo(),
        api.listBackups().catch(() => [])
      ]);
      setSystemInfo(info);
      setBackups(bks);

      try {
        const vers = await api.fetchVersions();
        setVersions(vers);
      } catch (err: any) {
        console.warn('Failed to fetch remote versions:', err);
        setNetworkError(err.message || '無法連線至 GitHub (api.github.com)');
        setVersions([]);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAppUpdate = async (manual = false) => {
    try {
      setCheckingAppUpdate(true);
      const updateInfo = await api.checkAppUpdate();
      setAppUpdate(updateInfo);
      if (manual) {
        if (updateInfo.hasUpdate) {
          setDismissedUpdate(false);
        } else if (updateInfo.error) {
          alert(`檢查更新失敗: ${updateInfo.error}`);
        } else {
          alert(`目前已是最新版本 (v${updateInfo.currentVersion})！`);
        }
      }
    } catch (err: any) {
      if (manual) {
        alert(`檢查更新失敗: ${err.message}`);
      }
    } finally {
      setCheckingAppUpdate(false);
    }
  };

  const handleInstallAppUpdate = async () => {
    if (!appUpdate?.downloadAsset) {
      if (appUpdate?.releaseUrl) {
        api.openExternal(appUpdate.releaseUrl);
      }
      return;
    }

    setLogs([]);
    setLogModalTitle(`正在更新管理器至 ${appUpdate.latestVersion}`);
    setIsFinished(false);
    setLogModalOpen(true);
    setUpdatingApp(true);

    try {
      await api.installAppUpdate(appUpdate.downloadAsset, (msg) => {
        setLogs((prev) => [...prev, msg]);
      });
      setIsFinished(true);
    } catch (err: any) {
      setLogs((prev) => [...prev, `[❌ 更新失敗] ${err.message}`]);
      setIsFinished(true);
    } finally {
      setUpdatingApp(false);
    }
  };

  useEffect(() => {
    loadData();
    handleCheckAppUpdate(false);
  }, []);

  const handleReload = async () => {
    try {
      setReloading(true);
      const res = await api.reloadRime();
      alert(res.output || (res.success ? '重新部署成功！' : '無法自動重新部署'));
      await loadData();
    } catch (e: any) {
      alert(`重新部署失敗: ${e.message}`);
    } finally {
      setReloading(false);
    }
  };

  const handleOpenFolder = async () => {
    try {
      await api.openRimeFolder();
    } catch (e: any) {
      alert(`無法開啟資料夾: ${e.message}`);
    }
  };

  const handleDeploy = async (version: RemoteVersion) => {
    setLogs([]);
    setLogModalTitle(`正在部署: ${version.shortSha} - ${version.title}`);
    setIsFinished(false);
    setLogModalOpen(true);
    setDeploying(true);

    try {
      await api.deployVersion(
        { sha: version.sha, title: version.title },
        (msg) => setLogs((prev) => [...prev, msg])
      );
      setIsFinished(true);
      await loadData();
    } catch (err: any) {
      setLogs((prev) => [...prev, `[❌ 失敗] ${err.message}`]);
      setIsFinished(true);
    } finally {
      setDeploying(false);
    }
  };

  const handleLocalImport = async (targetPath?: string) => {
    let filePath = targetPath;
    if (!filePath) {
      const res = await api.selectLocalRepo();
      if (res.canceled || !res.filePaths || res.filePaths.length === 0) {
        return;
      }
      filePath = res.filePaths[0];
    }

    const fileName = filePath.split(/[\/\\]/).pop() || filePath;
    setLogs([]);
    setLogModalTitle(`正在匯入本地 REPO: ${fileName}`);
    setIsFinished(false);
    setLogModalOpen(true);
    setDeploying(true);

    try {
      await api.deployLocalRepo(filePath, (msg) => setLogs((prev) => [...prev, msg]));
      setIsFinished(true);
      await loadData();
    } catch (err: any) {
      setLogs((prev) => [...prev, `[❌ 匯入失敗] ${err.message}`]);
      setIsFinished(true);
    } finally {
      setDeploying(false);
    }
  };

  const handleRestore = async (backupId: string) => {
    if (!confirm(`確定要還原快照「${backupId}」嗎？\n現有設定會先被自動安全備份，且個人自訂詞頻 (userdb) 不會受影響。`)) {
      return;
    }

    setLogs([]);
    setLogModalTitle(`正在還原快照: ${backupId}`);
    setIsFinished(false);
    setLogModalOpen(true);
    setRestoring(true);

    try {
      await api.restoreBackup(backupId, (msg) => setLogs((prev) => [...prev, msg]));
      setIsFinished(true);
      await loadData();
    } catch (err: any) {
      setLogs((prev) => [...prev, `[❌ 失敗] ${err.message}`]);
      setIsFinished(true);
    } finally {
      setRestoring(false);
    }
  };

  const handleCreateBackup = async (note: string) => {
    try {
      await api.createBackup(note);
      await loadData();
    } catch (err: any) {
      alert(`備份失敗: ${err.message}`);
    }
  };

  const handleExportForTrime = (_version?: RemoteVersion) => {
    setAndroidModalOpen(true);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const filePath = (file as any).path;
      if (filePath) {
        handleLocalImport(filePath);
      }
    }
  };

  const latestVersion = versions.length > 0 ? versions[0] : null;

  return (
    <main
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative min-h-screen bg-slate-950 p-6 md:p-8 flex flex-col items-center justify-start text-slate-100"
    >
      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-40 bg-slate-950/90 border-4 border-dashed border-amber-500 rounded-3xl m-4 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-200">
          <UploadCloud className="w-16 h-16 text-amber-400 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-amber-300">放開以直接匯入本地 REPO</h2>
          <p className="text-sm text-slate-400 mt-1">支援 .zip 壓縮檔或設定檔資料夾</p>
        </div>
      )}

      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <Header
          onReload={handleReload}
          onOpenFolder={handleOpenFolder}
          reloading={reloading}
          appVersion={systemInfo?.appVersion || '1.2.2'}
          hasAppUpdate={Boolean(appUpdate?.hasUpdate)}
          checkingAppUpdate={checkingAppUpdate}
          onCheckAppUpdate={() => handleCheckAppUpdate(true)}
          onOpenAndroidExport={() => setAndroidModalOpen(true)}
        />

        {/* App Self-Update Notification Banner */}
        {appUpdate?.hasUpdate && !dismissedUpdate && (
          <div className="w-full bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-950/30 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-amber-200">
                    發現洋蔥注音管理器新版本：{appUpdate.latestVersion}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    最新釋出
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                  {appUpdate.releaseName || '包含最新效能優化與修復'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {appUpdate.downloadAsset ? (
                <button
                  onClick={handleInstallAppUpdate}
                  disabled={updatingApp}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  title="直接在背景下載並以管理員權限安裝更新"
                >
                  <DownloadCloud className={`w-3.5 h-3.5 ${updatingApp ? 'animate-bounce' : ''}`} />
                  <span>{updatingApp ? '安裝更新中...' : '⚡ 直接安裝更新'}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (appUpdate.releaseUrl) {
                      api.openExternal(appUpdate.releaseUrl);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <span>前往下載更新</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}

              {appUpdate.releaseUrl && appUpdate.downloadAsset && (
                <button
                  onClick={() => api.openExternal(appUpdate.releaseUrl!)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
                  title="在瀏覽器查看更新說明"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => setDismissedUpdate(true)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
                title="關閉提示"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Current Status */}
        <StatusCard info={systemInfo} loading={loading} />

        {/* Deploy & Update Card (With Local Import & Error handling) */}
        <UpdateCard
          latest={latestVersion}
          info={systemInfo}
          onDeploy={handleDeploy}
          onLocalImport={() => handleLocalImport()}
          onRetry={loadData}
          deploying={deploying}
          loading={loading}
          error={networkError}
        />

        {/* Android / Trime Export Card */}
        <TrimeExportCard
          versions={versions}
          loading={loading}
          exporting={false}
          error={networkError}
          onExport={handleExportForTrime}
          onOpenModal={() => setAndroidModalOpen(true)}
        />

        {/* Tabs for Version History and Local Snapshots */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800/80 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'history'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                GitHub 遠端版本 ({versions.length})
              </button>
              <button
                onClick={() => setActiveTab('backups')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'backups'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                本地備份快照 ({backups.length})
              </button>
            </div>

            <button
              onClick={() => handleLocalImport()}
              disabled={deploying}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/30 rounded-lg transition-colors"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>📂 本地匯入 REPO (ZIP/資料夾)</span>
            </button>
          </div>

          {activeTab === 'history' ? (
            versions.length > 0 ? (
              <HistorySection
                versions={versions}
                currentSha={systemInfo?.installedSha || null}
                onDeploy={handleDeploy}
                deploying={deploying}
              />
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                {networkError ? (
                  <div>
                    <p className="text-slate-400 font-medium mb-1">因網路或防火牆限制，無法連線取得遠端歷史 Commit 清單</p>
                    <p>你可以直接使用右上方「📂 本地匯入 REPO」按鈕進行離線部署！</p>
                  </div>
                ) : (
                  <p>正在載入版本清單...</p>
                )}
              </div>
            )
          ) : (
            <BackupSection
              backups={backups}
              onRestore={handleRestore}
              onCreateBackup={handleCreateBackup}
              restoring={restoring}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="pt-6 pb-2 text-center text-xs text-slate-500 border-t border-slate-900">
          <p>
            專為{' '}
            <a
              href="https://github.com/houtacheng/rime-bopomo-onion-mixed"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400/80 hover:text-amber-300 underline underline-offset-2"
            >
              houtacheng/rime-bopomo-onion-mixed
            </a>{' '}
            打造 · 支援 macOS (鼠鬚管)、Windows (小狼毫) 與 Android (同文輸入法 Trime)
          </p>
        </footer>
      </div>

      {/* Deploy / Restore Log Terminal Modal */}
      <LogModal
        logs={logs}
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        title={logModalTitle}
        isFinished={isFinished}
      />

      {/* Android / Trime Export Modal */}
      <AndroidExportModal
        isOpen={androidModalOpen}
        onClose={() => setAndroidModalOpen(false)}
        versions={versions}
        installedSha={systemInfo?.installedSha}
      />
    </main>
  );
};

export default App;
