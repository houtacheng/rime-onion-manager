import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  X,
  Keyboard,
  FolderOpen,
  Download,
  CheckCircle2,
  Copy,
  Info,
  Layers,
  GitBranch,
  Sliders,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { api } from '../api';
import { TrimeLayoutType, TrimeExportResult, RemoteVersion } from '../types';

interface AndroidExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  versions?: RemoteVersion[];
  installedSha?: string | null;
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({
  isOpen,
  onClose,
  versions = [],
  installedSha = null
}) => {
  const [selectedVersionSha, setSelectedVersionSha] = useState<string>('latest');
  const [layoutType, setLayoutType] = useState<TrimeLayoutType>('samsung');
  const [customPath, setCustomPath] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<TrimeExportResult | null>(null);
  const [openedEditor, setOpenedEditor] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      setLogs([]);
      setCopied(false);
      setOpenedEditor(false);
      setSelectedVersionSha('latest');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const defaultFileName = `rime-onion-trime-${layoutType}.zip`;

  const handleSelectSaveLocation = async () => {
    try {
      const res = await api.showSaveDialog({
        defaultPath: defaultFileName,
        filters: [{ name: 'ZIP 壓縮檔案', extensions: ['zip'] }]
      });
      if (!res.canceled && res.filePath) {
        setCustomPath(res.filePath);
      }
    } catch (e) {
      console.error('Failed to choose save location:', e);
    }
  };

  const executePackageExport = async () => {
    let versionSha: string | undefined = undefined;
    let versionTitle: string | undefined = undefined;

    if (selectedVersionSha === 'local') {
      versionSha = 'local';
      versionTitle = '本機目前安裝版本';
    } else if (selectedVersionSha === 'latest') {
      if (versions.length > 0) {
        versionSha = versions[0].sha;
        versionTitle = `最新遠端版本 (${versions[0].shortSha})`;
      } else {
        versionSha = 'main';
        versionTitle = 'GitHub 最新版本';
      }
    } else {
      const found = versions.find((v) => v.sha === selectedVersionSha);
      versionSha = selectedVersionSha;
      versionTitle = found ? `${found.shortSha} — ${found.title}` : selectedVersionSha.substring(0, 7);
    }

    const targetPath = customPath || undefined;
    return await api.exportTrimePackage(
      { layoutType, targetZipPath: targetPath, versionSha, versionTitle },
      (msg) => setLogs((prev) => [...prev, msg])
    );
  };

  // 1. 核心流程：產生設定包並直接丟入 Trime 編輯器
  const handleExportAndOpenEditor = async () => {
    try {
      setExporting(true);
      setLogs([]);
      setResult(null);
      setOpenedEditor(false);

      const res = await executePackageExport();
      setResult(res);

      if (res.success) {
        setLogs((prev) => [...prev, '[🚀] 正在啟動 Trime 視覺化編輯器...']);
        await api.openTrimeEditor({ zipPath: res.zipPath });
        setOpenedEditor(true);
        setLogs((prev) => [
          ...prev,
          '[✨] 已成功載入 Trime 編輯器！請在編輯器中檢查鍵盤佈局，完成後點選右上角「💾 匯出手機版 ZIP」即可放入手機。'
        ]);
      }
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message || '操作失敗'
      });
    } finally {
      setExporting(false);
    }
  };

  // 2. 備用流程：直接下載 ZIP 檔
  const handleDirectExport = async () => {
    try {
      setExporting(true);
      setLogs([]);
      setResult(null);
      setOpenedEditor(false);

      const res = await executePackageExport();
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message || '匯出失敗'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleCopyGuide = () => {
    const guideText = `【洋蔥注音 Android Trime 同文輸入法安裝說明】
1. 將此 ZIP 傳至手機（透過 USB、通訊軟體或雲端硬碟）。
2. 在手機上解壓縮，將解出的 rime 資料夾內所有檔案貼至手機的 Trime 目錄：
   - Android 11 以上：Android/data/com.osfans.trime/files/rime/
   - 舊版 Android：/sdcard/rime/
   （可至 Trime App → 設定 → 查看「檔案目錄」確認路徑）
3. 若先前曾部署失敗，請先刪除該目錄下的「build」資料夾以清除舊快取。
4. 開啟「同文輸入法 (Trime)」App，點選「重新部署」（Deploy），等待提示完成即可！`;
    navigator.clipboard.writeText(guideText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenFolder = () => {
    if (result?.zipPath) {
      api.showItemInFolder(result.zipPath);
    }
  };

  const handleLaunchEditorAgain = () => {
    api.openTrimeEditor({ zipPath: result?.zipPath });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 shrink-0">
              <Smartphone className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                匯出 Android 手機設定包 (Trime 同文輸入法)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                整合洋蔥注音方案與三星鍵盤配置，一鍵丟入視覺化編輯器或直接打包
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Step 1: Select Schema Version */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5" />
              步驟 1：選擇洋蔥注音方案版本來源
            </label>
            <select
              value={selectedVersionSha}
              onChange={(e) => setSelectedVersionSha(e.target.value)}
              disabled={exporting}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="latest">
                ✨ GitHub 最新雲端版本 (預設推薦)
              </option>
              <option value="local">
                💻 本機現有洋蔥設定 (包含您目前的詞庫與配置)
              </option>
              {versions.map((ver) => (
                <option key={ver.sha} value={ver.sha}>
                  🔖 {ver.shortSha} — {ver.title} ({new Date(ver.date).toLocaleDateString()})
                  {installedSha && ver.sha.startsWith(installedSha) ? ' [本機現有版本]' : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              可直接下載 GitHub 上的任何 Commit 或 Release 版本，或直接打包本機目前的自訂詞庫。
            </p>
          </div>

          {/* Step 2: Select Layout */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              步驟 2：選擇手機注音鍵盤佈局
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: Samsung OneUI Style (Default Recommended) */}
              <div
                onClick={() => !exporting && setLayoutType('samsung')}
                className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  layoutType === 'samsung'
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-100 text-sm">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>三星 OneUI 旗艦</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                      ⭐ 推薦首選
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    三星原廠注音手感：右上小字、長按「。」3排智慧標點、長按「@」符號、空白鍵左右滑動移游標。
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-amber-300/80 font-mono bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                  <span>ㄅ ㄉ ˇ ˋ ㄓ ˊ ˙ ㄚ ㄞ ㄢ ㄦ</span>
                </div>
              </div>

              {/* Option 2: Standard Bopomofo */}
              <div
                onClick={() => !exporting && setLayoutType('standard')}
                className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  layoutType === 'standard'
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-100 text-sm">
                      <Keyboard className="w-4 h-4 text-slate-300" />
                      <span>傳統標準注音</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      直式排列
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    標準注音符號直排佈局（ㄅㄆㄇㄈㄉㄊ...），與傳統注音鍵盤一致。
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                  <span>ㄅ ㄉ ˇ ˋ ㄓ ˊ ˙ ㄚ ㄞ ㄢ</span>
                </div>
              </div>

              {/* Option 3: QWERTY Bopomofo */}
              <div
                onClick={() => !exporting && setLayoutType('qwerty')}
                className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  layoutType === 'qwerty'
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/50'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-100 text-sm">
                      <Keyboard className="w-4 h-4 text-slate-300" />
                      <span>QWERTY 配對</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      電腦習慣
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    英文字母與注音雙標籤（Q=ㄆ, W=ㄊ...），適合外接藍牙鍵盤愛好者。
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                  <span>Q(ㄆ) W(ㄊ) E(ㄍ) R(ㄐ)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Destination */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" />
              步驟 3：備用匯出儲存位置
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-slate-300 truncate">
                {customPath || `[預設下載資料夾] ~/Downloads/${defaultFileName}`}
              </div>
              <button
                onClick={handleSelectSaveLocation}
                disabled={exporting}
                className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors shrink-0"
              >
                變更位置...
              </button>
            </div>
          </div>

          {/* Log / Progress Stream */}
          {logs.length > 0 && (
            <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl font-mono text-xs text-slate-300 space-y-1 max-h-32 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-slate-300">
                  {log}
                </div>
              ))}
            </div>
          )}

          {/* Opened Editor Banner */}
          {openedEditor && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>已將設定檔送入 Trime 鍵盤編輯器！</span>
                </div>
                <button
                  onClick={handleLaunchEditorAgain}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg border border-emerald-500/40 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>聚焦編輯器視窗</span>
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                編輯器已自動載入您的洋蔥注音鍵盤設定。您可以在編輯器內即時微調按鍵排列、縮排、按鍵符號與樣式配色，完成後直接點選編輯器右上角<strong>「💾 匯出手機版 ZIP」</strong>即可放回手機部署！
              </p>
            </div>
          )}

          {/* Export Success Card */}
          {result?.success && !openedEditor && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>設定包打包成功 ({result.sizeMB} MB)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyGuide}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? '已複製說明！' : '複製安裝說明'}</span>
                  </button>
                  <button
                    onClick={handleOpenFolder}
                    className="px-2.5 py-1 text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg border border-emerald-500/40 transition-colors"
                  >
                    開啟檔案位置
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 break-all select-all">
                {result.zipPath}
              </div>
            </div>
          )}

          {/* Error message */}
          {result && !result.success && (
            <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-2xl text-xs text-rose-300">
              ❌ 匯出失敗：{result.error}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>內建自動載入 Trime 編輯器，即時預覽微調更直覺</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              disabled={exporting}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              關閉
            </button>

            {/* Direct Export Button */}
            <button
              onClick={handleDirectExport}
              disabled={exporting}
              title="不透過編輯器，直接輸出 ZIP 到下載資料夾"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>直接匯出 ZIP</span>
            </button>

            {/* Primary Button: Load into Trime Editor */}
            <button
              onClick={handleExportAndOpenEditor}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Sliders className={`w-3.5 h-3.5 ${exporting ? 'animate-spin' : ''}`} />
              <span>{exporting ? '正在傳送設定檔...' : '🎨 丟入 Trime 編輯器微調並匯出'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
