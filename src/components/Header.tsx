import React from 'react';
import { RotateCw, FolderOpen, ShieldCheck, Sparkles, Smartphone } from 'lucide-react';

interface HeaderProps {
  onReload: () => void;
  onOpenFolder: () => void;
  reloading: boolean;
  appVersion?: string;
  hasAppUpdate?: boolean;
  checkingAppUpdate?: boolean;
  onCheckAppUpdate: () => void;
  onOpenAndroidExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReload,
  onOpenFolder,
  reloading,
  appVersion = '1.3.1',
  hasAppUpdate = false,
  checkingAppUpdate = false,
  onCheckAppUpdate,
  onOpenAndroidExport
}) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600/30 to-amber-400/20 border border-amber-500/30 flex items-center justify-center p-1.5 shadow-lg shadow-amber-500/10 shrink-0 overflow-hidden">
          <img src="/onion.png" alt="洋蔥注音" className="w-full h-full object-contain drop-shadow" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">洋蔥注音 Rime 管理器</h1>
            <button
              onClick={onCheckAppUpdate}
              disabled={checkingAppUpdate}
              title="點擊檢查是否有新版本"
              className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                hasAppUpdate
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              v{appVersion}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            自動保護個人自訂詞庫與詞頻 (userdb)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          onClick={onCheckAppUpdate}
          disabled={checkingAppUpdate}
          className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/30 rounded-lg transition-colors disabled:opacity-50"
          title="檢查管理器自身是否有新版本發布"
        >
          <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${checkingAppUpdate ? 'animate-spin' : ''}`} />
          <span>{checkingAppUpdate ? '檢查中...' : '檢查更新'}</span>
          {hasAppUpdate && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          )}
        </button>

        {onOpenAndroidExport && (
          <button
            onClick={onOpenAndroidExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 rounded-lg transition-colors"
            title="匯出適用於 Android (Trime 同文輸入法) 的注音設定包與鍵盤"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android 匯出</span>
          </button>
        )}

        <button
          onClick={onOpenFolder}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors"
          title="開啟 Rime 設定資料夾"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>開啟資料夾</span>
        </button>

        <button
          onClick={onReload}
          disabled={reloading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/30 rounded-lg transition-colors disabled:opacity-50"
          title="觸發輸入法重新加載設定 (Reload / Deploy)"
        >
          <RotateCw className={`w-3.5 h-3.5 ${reloading ? 'animate-spin' : ''}`} />
          <span>重新部署</span>
        </button>
      </div>
    </header>
  );
};
