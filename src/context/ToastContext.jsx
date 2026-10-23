import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((type, message) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const api = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg bg-white border ${
              t.type === 'success' ? 'border-accent-200' : t.type === 'error' ? 'border-red-200' : 'border-navy-200'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-accent-600" />}
            {t.type === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
            {t.type === 'info' && <Info className="h-5 w-5 text-navy-600" />}
            <span className="text-sm text-navy-800">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
