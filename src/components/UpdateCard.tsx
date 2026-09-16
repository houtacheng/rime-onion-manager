import React from 'react';
import { RemoteVersion, SystemInfo } from '../types';
import { Sparkles, ArrowUpRight, Check, Clock, ShieldCheck, DownloadCloud } from 'lucide-react';

interface UpdateCardProps {
  latest: RemoteVersion | null;
  info: SystemInfo | null;
  onDeploy: (version: RemoteVersion) => void;
  deploying: boolean;
}

export const UpdateCard: React.FC<UpdateCardProps> = ({ latest, info, onDeploy, deploying }) => {
  if (!latest) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-500 animate-pulse">
        正在連線 GitHub 獲取最新設定檔版本...
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
