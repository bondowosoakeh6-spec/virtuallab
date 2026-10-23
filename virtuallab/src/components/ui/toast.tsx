"use client";

/**
 * Toast Notification System
 * Feature #77: Loading / Error States
 *
 * Success, error, warning, info variants.
 * Auto-dismiss, dismissible, accessible (role=alert), stacks vertically.
 */

import React, { createContext, useContext, useState, useCallback, useId } from "react";
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";

// ============================================================
// Types
// ============================================================
type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ============================================================
// Context
// ============================================================
const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// ============================================================
// Toast Provider
// ============================================================
interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const duration = toast.duration ?? (toast.variant === "error" ? 8000 : 5000);

      setToasts((prev) => {
        const next = [...prev, { ...toast, id, duration }];
        return next.slice(-maxToasts);
      });

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [maxToasts, removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => addToast({ variant: "success", title, message }),
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => addToast({ variant: "error", title, message, duration: 8000 }),
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => addToast({ variant: "warning", title, message }),
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => addToast({ variant: "info", title, message }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// ============================================================
// Toast Container — renders stack of toasts
// ============================================================
interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 max-w-sm w-full pointer-events-none sm:bottom-6 sm:right-6"
      aria-live="polite"
      aria-relevant="additions removals"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

// ============================================================
// Toast Item — individual toast notification
// ============================================================
const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: React.ReactNode; bgClass: string; borderClass: string; iconColor: string }
> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5" aria-hidden="true" />,
    bgClass: "bg-white",
    borderClass: "border-emerald-200",
    iconColor: "text-emerald-500",
  },
  error: {
    icon: <AlertCircle className="w-5 h-5" aria-hidden="true" />,
    bgClass: "bg-white",
    borderClass: "border-rose-200",
    iconColor: "text-rose-500",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" aria-hidden="true" />,
    bgClass: "bg-white",
    borderClass: "border-amber-200",
    iconColor: "text-amber-500",
  },
  info: {
    icon: <Info className="w-5 h-5" aria-hidden="true" />,
    bgClass: "bg-white",
    borderClass: "border-blue-200",
    iconColor: "text-blue-500",
  },
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const config = VARIANT_CONFIG[toast.variant];

  return (
    <div
      className={`
        pointer-events-auto
        flex items-start gap-3 p-4
        rounded-lg border shadow-lg
        ${config.bgClass} ${config.borderClass}
        animate-in slide-in-from-right-full fade-in-0
        transition-all duration-300
      `}
      role="alert"
      aria-atomic="true"
    >
      <span className={`shrink-0 mt-0.5 ${config.iconColor}`}>
        {config.icon}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-500 mt-0.5">{toast.message}</p>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="
          shrink-0 w-6 h-6 flex items-center justify-center
          rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
          transition-colors
        "
        aria-label="Tutup notifikasi"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
