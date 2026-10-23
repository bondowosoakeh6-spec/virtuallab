"use client";

/**
 * Loading, Error, Empty, and Retry State Components
 * Feature #77: Loading / Error States
 *
 * Setiap API harus memiliki: Loading, Success, Empty, Error, Retry
 * Jangan membiarkan blank page.
 */

import React from "react";
import { Loader2, AlertTriangle, Inbox, RefreshCw, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================================
// LoadingState — Spinner with message
// ============================================================
interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Memuat data...", className = "" }: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 space-y-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" aria-hidden="true" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

// ============================================================
// ErrorState — Error icon, message, retry button
// ============================================================
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Terjadi Kesalahan",
  message = "Gagal memuat data. Silakan coba lagi.",
  onRetry,
  retryLabel = "Coba Lagi",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 space-y-4 text-center ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-rose-500" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

// ============================================================
// EmptyState — Icon, title, description, optional action
// ============================================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title = "Data Kosong",
  description = "Belum ada data yang tersedia.",
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 space-y-4 text-center ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
        {icon || <Inbox className="w-7 h-7 text-slate-400" aria-hidden="true" />}
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-700">{title}</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="gap-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// ============================================================
// PageLoader — Full page loading overlay
// ============================================================
interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "Memuat halaman..." }: PageLoaderProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" aria-hidden="true" />
      <p className="text-sm text-slate-600 mt-4">{message}</p>
    </div>
  );
}

// ============================================================
// SkeletonLoader — Skeleton placeholder shapes
// ============================================================
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded ${className}`}
      role="presentation"
      aria-hidden="true"
    />
  );
}

export function SkeletonLoader({ lines = 3, className = "" }: SkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Memuat konten...">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
      <span className="sr-only">Memuat konten...</span>
    </div>
  );
}

// ============================================================
// SkeletonTable — Table skeleton with rows
// ============================================================
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="space-y-2" role="status" aria-label="Memuat tabel...">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-6" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton key={`${row}-${col}`} className="h-5" />
          ))}
        </div>
      ))}
      <span className="sr-only">Memuat tabel...</span>
    </div>
  );
}

// ============================================================
// ApiStateWrapper — Wraps content with loading/error/empty/success
// ============================================================
interface ApiStateWrapperProps {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  onRetry?: () => void;
  loadingMessage?: string;
  errorMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
}

export function ApiStateWrapper({
  loading,
  error,
  isEmpty,
  onRetry,
  loadingMessage,
  errorMessage,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyActionLabel,
  onEmptyAction,
  children,
  skeleton,
}: ApiStateWrapperProps) {
  if (loading) {
    return skeleton || <LoadingState message={loadingMessage} />;
  }

  if (error) {
    return <ErrorState message={errorMessage || error} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return <>{children}</>;
}

// ============================================================
// ServerErrorState — 500-level error display
// ============================================================
export function ServerErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 space-y-4 text-center"
      role="alert"
    >
      <ServerCrash className="w-16 h-16 text-slate-300" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-slate-800">Server Error</h2>
      <p className="text-sm text-slate-500 max-w-sm">
        Terjadi kesalahan pada server. Tim teknis telah diberitahu. Silakan coba lagi nanti.
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2 mt-2">
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Muat Ulang
        </Button>
      )}
    </div>
  );
}
