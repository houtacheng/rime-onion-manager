import React, { useState } from 'react';
import { RemoteVersion } from '../types';
import { History, GitCommit, RotateCcw } from 'lucide-react';

interface HistorySectionProps {
  versions: RemoteVersion[];
  currentSha: string | null;
  onDeploy: (version: RemoteVersion) => void;
  deploying: boolean;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  versions,
  currentSha,
  onDeploy,
  deploying
}) => {
  const [expanded, setExpanded] = useState(false);
  const displayList = expanded ? versions : versions.slice(0, 5);

  return (
    <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">GitHub 歷史版本庫</h3>
          <span className="text-xs text-slate-500">（可切換至任一歷史 Commit）</span>
        </div>
        {versions.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            {expanded ? '收合清單' : `查看更多 (${versions.length})`}
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {displayList.map((ver) => {
          const isCurrent = Boolean(currentSha && currentSha.startsWith(ver.shortSha));

          return (
            <div
              key={ver.sha}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-amber-500/5 border-amber-500/30'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              <div className="flex items-start gap-3 overflow-hidden mr-3">
                <div className="mt-0.5">
                  <GitCommit
                    className={`w-4 h-4 ${isCurrent ? 'text-amber-400' : 'text-slate-500'}`}
                  />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-300">
                      {ver.shortSha}
                    </span>
                    <span className="text-xs font-medium text-slate-200 truncate" title={ver.title}>
                      {ver.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                        當前版本
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(ver.date).toLocaleString('zh-TW')} {ver.author ? `· ${ver.author}` : ''}
                  </div>
                </div>
              </div>

              <div>
                {isCurrent ? (
                  <span className="text-xs text-slate-500 font-medium px-2 py-1">使用中</span>
                ) : (
                  <button
                    onClick={() => onDeploy(ver)}
                    disabled={deploying}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors disabled:opacity-40"
                    title="將 Rime 切換至此歷史版本"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>切換至此版</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
