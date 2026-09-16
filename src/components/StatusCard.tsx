import React from 'react';
import { SystemInfo } from '../types';
import { Terminal, GitCommit } from 'lucide-react';

interface StatusCardProps {
  info: SystemInfo | null;
  loading: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({ info, loading }) => {
  if (loading || !info) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/4 mb-3"></div>
        <div className="h-6 bg-slate-800 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-850 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">輸入法狀態</span>
        </div>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/50">
          {info.platform}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div>
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-amber-400" />
            當前使用版本
          </div>
          {info.installedSha ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {info.installedSha.substring(0, 7)}
                </span>
                <span className="text-xs text-slate-300 truncate max-w-[180px]" title={info.installedMessage || ''}>
                  {info.installedMessage || '已部署版本'}
                </span>
              </div>
              {info.installedDate && (
                <div className="text-[11px] text-slate-500 mt-1">
                  安裝時間: {new Date(info.installedDate).toLocaleString('zh-TW')}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              尚未透過本工具部署（但 Rime 目錄已就緒）
            </div>
          )}
        </div>

        <div>
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            設定檔目錄
          </div>
          <div className="text-xs font-mono text-slate-300 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800/80 truncate" title={info.rimeDir}>
            {info.rimeDir}
          </div>
        </div>
      </div>
    </div>
  );
};
