import React from 'react';
import { RotateCw, FolderOpen, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onReload: () => void;
  onOpenFolder: () => void;
  reloading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReload, onOpenFolder, reloading }) => {
  return (
    <header className="flex items-center justify-between pb-6 border-b border-slate-800/80">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
          🧅
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">洋蔥注音 Rime 管理器</h1>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              v1.1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            自動保護個人自訂詞庫與詞頻 (userdb)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
