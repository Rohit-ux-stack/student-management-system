import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_ICONS: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_CLASS_MAP: Record<ToastType, string> = {
  success: 'clay-toast-success',
  error: 'clay-toast-error',
  warning: 'clay-toast-warning',
  info: 'clay-toast-info',
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const success = useCallback(
    (msg: string, dur?: number) => showToast(msg, 'success', dur),
    [showToast]
  );
  const error = useCallback(
    (msg: string, dur?: number) => showToast(msg, 'error', dur),
    [showToast]
  );
  const info = useCallback(
    (msg: string, dur?: number) => showToast(msg, 'info', dur),
    [showToast]
  );
  const warning = useCallback(
    (msg: string, dur?: number) => showToast(msg, 'warning', dur),
    [showToast]
  );

  const contextValue = React.useMemo(
    () => ({
      showToast,
      success,
      error,
      info,
      warning,
      dismissToast,
    }),
    [showToast, success, error, info, warning, dismissToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Floating Claymorphic Toast Container */}
      <div
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 w-max max-w-[calc(100vw-2rem)] pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const IconComponent = TOAST_ICONS[t.type] || Info;
          const toastTypeClass = TOAST_CLASS_MAP[t.type] || 'clay-toast-info';

          return (
            <div
              key={t.id}
              role="status"
              className={`clay-toast ${toastTypeClass} animate-toast pointer-events-auto p-4 flex items-center justify-between gap-3`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <IconComponent className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold m-0 leading-snug min-w-0 break-words">
                  {t.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="Close notification"
                className="shrink-0 p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

export default ToastContext;
