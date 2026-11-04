import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useLibrary();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all transform duration-200 ${
            toast.type === 'success'
              ? 'bg-white border-emerald-200 text-neutral-900 shadow-emerald-500/5'
              : toast.type === 'error'
              ? 'bg-white border-rose-200 text-neutral-900 shadow-rose-500/5'
              : 'bg-white border-neutral-200 text-neutral-900 shadow-neutral-500/5'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-neutral-700" />}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold tracking-tight text-neutral-900">{toast.title}</h4>
            {toast.message && (
              <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{toast.message}</p>
            )}
          </div>

          <button
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
