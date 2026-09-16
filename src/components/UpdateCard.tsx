import React from 'react';
import { RemoteVersion, SystemInfo } from '../types';
import { Sparkles, ArrowUpRight, Check, Clock, ShieldCheck, DownloadCloud, FolderArchive, AlertCircle, RefreshCw } from 'lucide-react';

interface UpdateCardProps {
  latest: RemoteVersion | null;
  info: SystemInfo | null;
  onDeploy: (version: RemoteVersion) => void;
  onLocalImport: () => void;
  onRetry: () => void;
  deploying: boolean;
  loading: boolean;
  error: string | null;
}

export const UpdateCard: React.FC<UpdateCardProps> = ({
  latest,
  info,
  onDeploy,
  onLocalImport,
  onRetry,
  deploying,
  loading,
  error
}) => {
  // If network error occurred (e.g. firewall blocked)
  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-6 shadow-xl shadow-black/40">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-300">連線 GitHub 受阻（寺院/內網防火牆限制）</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {error}
            </p>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-4">
          <div className="text-xs font-semibold text-slate-300 mb-1">💡 解決方案：</div>
          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
            <li>請網管在防火牆放行 <code className="text-amber-400 font-mono">api.github.com</code> 與 <code className="text-amber-400 font-mono">codeload.github.com</code></li>
            <li>或<strong>直接使用下方按鈕</strong>匯入你已下載好的 REPO 壓縮包（.zip）或資料夾！</li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onLocalImport}
            disabled={deploying}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <FolderArchive className="w-4 h-4" />
            <span>📂 選擇本地 ZIP 壓縮檔 / 資料夾匯入</span>
          </button>

          <button
            onClick={onRetry}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>重試連線</span>
          </button>
        </div>
      </div>
    );
  }

  // If still loading and no latest yet
  if (!latest) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>正在連線 GitHub 獲取最新設定檔版本...</span>
          </div>
          <span className="text-[11px] text-slate-500">若防火牆封鎖請使用本地匯入</span>
        </div>

        <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
          <span className="text-xs text-slate-400">無法連外網？</span>
          <button
            onClick={onLocalImport}
            disabled={deploying}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 transition-colors"
          >
            <FolderArchive className="w-4 h-4" />
            <span>📂 直接匯入本地 REPO (.zip)</span>
          </button>
        </div>
      </div>
    );
  }

  const isUpToDate = Boolean(info?.installedSha && info.installedSha.startsWith(latest.sha.substring(0, 7)));

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-amber-500/20 rounded-2xl p-6 shadow-xl shadow-black/40">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              GitHub 遠端最新版本
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLocalImport}
              disabled={deploying}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-lg transition-colors"
              title="匯入本地已下載的 REPO 壓縮包或資料夾"
            >
              <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
              <span>本地匯入</span>
            </button>

            <a
              href={`https://github.com/houtacheng/rime-bopomo-onion-mixed/commit/${latest.sha}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-300 transition-colors"
            >
              <span>檢視 GitHub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {latest.title}
            </h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {latest.shortSha}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              發布時間: {new Date(latest.date).toLocaleString('zh-TW')}
            </span>
            {latest.author && (
              <span>提交者: <strong className="text-slate-300 font-medium">{latest.author}</strong></span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span>部署時自動建立快照，且不覆蓋個人自訂詞庫與詞頻</span>
          </div>

          <div className="flex items-center gap-3">
            {isUpToDate ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                  <Check className="w-4 h-4" />
                  目前已是最新版本
                </span>
                <button
                  onClick={() => onDeploy(latest)}
                  disabled={deploying}
                  className="text-xs px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors disabled:opacity-50"
                  title="強制重新下載覆蓋並重載"
                >
                  {deploying ? '處理中...' : '重新部署'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => onDeploy(latest)}
                disabled={deploying}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DownloadCloud className={`w-4 h-4 ${deploying ? 'animate-bounce' : ''}`} />
                <span>{deploying ? '正在下載與部署...' : '🚀 一鍵部署最新版本'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
