import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start justify-between p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-0 animate-fade-in ${
              t.type === "success"
                ? "bg-slate-900/90 border-emerald-500/50 text-emerald-300"
                : t.type === "error"
                ? "bg-slate-900/90 border-rose-500/50 text-rose-300"
                : "bg-slate-900/90 border-blue-500/50 text-blue-300"
            }`}
          >
            <div className="flex gap-3">
              {t.type === "success" && <CheckCircle className="w-5 h-5 mt-0.5 shrink-0 text-emerald-400" />}
              {t.type === "error" && <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-rose-400" />}
              {t.type === "info" && <Info className="w-5 h-5 mt-0.5 shrink-0 text-blue-400" />}
              <span className="text-sm font-medium text-gray-200">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-3 shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
