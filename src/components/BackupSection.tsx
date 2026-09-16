import React, { useState } from 'react';
import { BackupItem } from '../types';
import { Archive, Plus, Undo2, Calendar, FileText } from 'lucide-react';

interface BackupSectionProps {
  backups: BackupItem[];
  onRestore: (backupId: string) => void;
  onCreateBackup: (note: string) => void;
  restoring: boolean;
}

export const BackupSection: React.FC<BackupSectionProps> = ({
  backups,
  onRestore,
  onCreateBackup,
  restoring
}) => {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');

  const handleCreate = () => {
    onCreateBackup(note || '手動快照備份');
    setNote('');
    setShowNoteInput(false);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">本地安全快照庫</h3>
          <span className="text-xs text-slate-500">（每次更新前自動建立，可隨時一鍵無損還原）</span>
        </div>

        <button
          onClick={() => setShowNoteInput(!showNoteInput)}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>建立手動備份</span>
        </button>
      </div>

      {showNoteInput && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-slate-950/60 border border-emerald-500/20 rounded-xl">
          <input
            type="text"
            placeholder="備份備註（例如：修改外觀前備份）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleCreate}
            className="px-3 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors"
          >
            確定備份
          </button>
          <button
            onClick={() => setShowNoteInput(false)}
            className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            取消
          </button>
        </div>
      )}

      {backups.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
          目前尚未有任何本地備份快照。在執行第一次更新時會自動建立！
        </div>
      ) : (
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {backups.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/80 transition-all"
            >
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <span>{item.note || item.id}</span>
                    {item.fromSha && (
                      <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        基於 {item.fromSha.substring(0, 7)}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.date).toLocaleString('zh-TW')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onRestore(item.id)}
                disabled={restoring}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition-colors disabled:opacity-40"
                title="還原所有設定檔至此快照"
              >
                <Undo2 className="w-3 h-3" />
                <span>還原此快照</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
