import React, { useEffect, useRef } from 'react';
import { Terminal, X } from 'lucide-react';

interface LogModalProps {
  logs: string[];
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isFinished: boolean;
}

export const LogModal: React.FC<LogModalProps> = ({ logs, isOpen, onClose, title, isFinished }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">{title}</h3>
          </div>
          {isFinished && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-slate-300 space-y-2 bg-slate-950/80 min-h-[220px]">
          {logs.map((log, index) => {
            const isSuccess = log.includes('✓') || log.includes('🎉') || log.includes('成功');
            const isWarn = log.includes('⚠️') || log.includes('需手動');
            return (
              <div
                key={index}
                className={`leading-relaxed ${
                  isSuccess ? 'text-emerald-400 font-semibold' : isWarn ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                {log}
              </div>
            );
          })}
          {!isFinished && (
            <div className="flex items-center gap-2 text-amber-400 animate-pulse pt-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>正在執行操作，請稍候...</span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>

        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            disabled={!isFinished}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isFinished ? '完成並關閉' : '處理中...'}
          </button>
        </div>
      </div>
    </div>
  );
};
