import React, { useState } from 'react';
import { Smartphone, PackageOpen, ChevronDown, CheckCircle2, ExternalLink, Info } from 'lucide-react';
import { RemoteVersion } from '../types';

interface TrimeExportCardProps {
  versions: RemoteVersion[];
  loading: boolean;
  exporting: boolean;
  error?: string | null;
  onExport?: (version: RemoteVersion) => void;
  onOpenModal?: () => void;
}

export const TrimeExportCard: React.FC<TrimeExportCardProps> = ({
  versions,
  loading,
  exporting,
  error,
  onExport,
  onOpenModal
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const selectedVersion = versions[selectedIdx] ?? null;

  return (
    <div className="w-full bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-700/40 rounded-2xl shadow-lg shadow-emerald-950/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-700/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-emerald-200 tracking-wide">📱 Android / Trime 匯出</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              為同文輸入法（Trime）打包含注音鍵盤設定的 ZIP
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
          title={expanded ? '收合' : '展開說明'}
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expandable quick guide */}
      {expanded && (
        <div className="px-5 py-3 bg-slate-900/60 border-b border-emerald-700/20 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-start gap-2 mb-2">
            <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 font-medium">安裝步驟</p>
          </div>
          <ol className="text-xs text-slate-400 space-y-1.5 ml-5 list-decimal marker:text-emerald-500">
            <li>點「匯出 ZIP」，管理器會下載設定檔並自動附加注音鍵盤設定</li>
            <li>將 ZIP 解壓，把 <code className="bg-slate-800 px-1 rounded text-emerald-300">rime/</code> 資料夾內所有檔案複製到手機的 <code className="bg-slate-800 px-1 rounded text-emerald-300">/sdcard/rime/</code></li>
            <li>開啟 Trime App → 右上角選單 → <strong className="text-slate-200">重新部署</strong></li>
            <li>完成！鍵盤上每個鍵都會顯示對應的注音符號</li>
          </ol>
          <div className="mt-3 p-2.5 bg-emerald-950/60 border border-emerald-700/30 rounded-xl">
            <p className="text-xs text-emerald-300 font-medium mb-1">⌨️ 按鍵對應（與桌機相同）</p>
            <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
              1=ㄅ q=ㄆ a=ㄇ z=ㄈ &nbsp; 2=ˊ 3=ˇ 4=ˋ 5=˙<br />
              w=ㄊ s=ㄋ x=ㄌ &nbsp; e=ㄎ d=ㄏ c=ㄐ<br />
              r=ㄒ f=ㄓ v=ㄔ &nbsp; t=ㄖ g=ㄗ b=ㄘ<br />
              y=ㄧ h=ㄨ n=ㄩ &nbsp; 空白鍵 = 第一聲
            </p>
          </div>
          <a
            href="https://github.com/osfans/trime"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-400/80 hover:text-emerald-300 underline underline-offset-2"
          >
            <ExternalLink className="w-3 h-3" />
            Trime（同文輸入法）GitHub
          </a>
        </div>
      )}

      {/* Controls */}
      <div className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Version selector */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="h-9 bg-slate-800/60 rounded-lg animate-pulse w-full" />
          ) : versions.length === 0 ? (
            <div className="text-xs text-slate-500 py-2">
              {error ? '無法取得版本列表（離線模式）' : '載入版本中...'}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">選擇版本</label>
              <select
                value={selectedIdx}
                onChange={e => setSelectedIdx(Number(e.target.value))}
                disabled={exporting}
                className="bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500/60 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {versions.map((v, i) => (
                  <option key={v.id} value={i}>
                    {i === 0 ? '🆕 ' : ''}{v.shortSha} — {v.title.slice(0, 40)}{v.title.length > 40 ? '...' : ''} {v.isRelease ? '✨' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Export button */}
        <button
          onClick={() => {
            if (onOpenModal) {
              onOpenModal();
            } else if (selectedVersion && onExport) {
              onExport(selectedVersion);
            }
          }}
          disabled={(!onOpenModal && !selectedVersion) || loading}
          className={`
            flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl shadow-sm transition-all
            ${exporting
              ? 'bg-emerald-700/60 text-emerald-300 cursor-wait'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:scale-105 active:scale-95'}
            disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shrink-0
          `}
          title="設定並打包含注音鍵盤設定的 ZIP，供 Android 同文輸入法使用"
        >
          {exporting ? (
            <>
              <PackageOpen className="w-4 h-4 animate-bounce" />
              <span>打包中...</span>
            </>
          ) : (
            <>
              <PackageOpen className="w-4 h-4" />
              <span>設定與匯出 ZIP</span>
            </>
          )}
        </button>
      </div>

      {/* Selected version info */}
      {selectedVersion && !loading && (
        <div className="px-5 pb-4 -mt-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>
              將匯出：<span className="text-slate-400 font-mono">{selectedVersion.shortSha}</span>
              {' '}— {selectedVersion.title.slice(0, 50)}
              {selectedVersion.isRelease && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-700/40 rounded">
                  Release
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
