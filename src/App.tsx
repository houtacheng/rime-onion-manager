import React, { useState, useEffect } from 'react';
import { api } from './api';
import { SystemInfo, RemoteVersion, BackupItem } from './types';
import { Header } from './components/Header';
import { StatusCard } from './components/StatusCard';
import { UpdateCard } from './components/UpdateCard';
import { HistorySection } from './components/HistorySection';
import { BackupSection } from './components/BackupSection';
import { LogModal } from './components/LogModal';

export const App: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [versions, setVersions] = useState<RemoteVersion[]>([]);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Log modal state
  const [logs, setLogs] = useState<string[]>([]);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logModalTitle, setLogModalTitle] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  const [activeTab, setActiveTab] = useState<'history' | 'backups'>('history');

  const loadData = async () => {
    try {
      setLoading(true);
      const [info, vers, bks] = await Promise.all([
        api.getSystemInfo(),
        api.fetchVersions().catch(() => []),
        api.listBackups().catch(() => [])
      ]);
      setSystemInfo(info);
      setVersions(vers);
      setBackups(bks);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  const latestVersion = versions.length > 0 ? versions[0] : null;

  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-8 flex flex-col items-center justify-start text-slate-100">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <Header
          onReload={handleReload}
          onOpenFolder={handleOpenFolder}
          reloading={reloading}
        />

        {/* Current Status */}
        <StatusCard info={systemInfo} loading={loading} />

        {/* Big One-Click Deploy Card */}
        <UpdateCard
          latest={latestVersion}
          info={systemInfo}
          onDeploy={handleDeploy}
          deploying={deploying}
        />

        {/* Tabs for Version History and Local Snapshots */}
        <div className="space-y-4">
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

          {activeTab === 'history' ? (
            <HistorySection
              versions={versions}
              currentSha={systemInfo?.installedSha || null}
              onDeploy={handleDeploy}
              deploying={deploying}
            />
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
            打造 · 支援 macOS (鼠鬚管) 與 Windows (小狼毫)
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
    </main>
  );
};

export default App;
