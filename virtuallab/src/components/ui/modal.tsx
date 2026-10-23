"use client";

/**
 * Accessible Modal Dialog Component
 * Feature #75 & #76: Responsive + Accessibility
 *
 * - Uses dialog HTML element
 * - Focus trap within modal
 * - Close on Escape key
 * - Close on backdrop click
 * - Prevent body scroll when open
 * - Proper ARIA attributes
 * - No overlapping (z-index management)
 * - Responsive: full-screen on mobile, centered on desktop
 */

import React, { useEffect, useRef, useCallback, useId } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-full mx-4",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = "",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  // ---- Open / Close ----
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.close();
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ---- Escape key ----
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // ---- Focus trap ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    },
    []
  );

  // ---- Backdrop click ----
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (!closeOnBackdrop) return;
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickedInsideDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!clickedInsideDialog) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className={`
        fixed inset-0 z-50 m-0 p-0
        bg-transparent
        backdrop:bg-black/50 backdrop:backdrop-blur-sm
        open:flex open:items-end open:sm:items-center open:justify-center
        w-full h-full max-w-full max-h-full
      `}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      aria-modal="true"
      role="dialog"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      onCancel={(e) => {
        e.preventDefault();
        if (closeOnEscape) onClose();
      }}
    >
      <div
        className={`
          w-full ${SIZES[size]}
          bg-white rounded-t-2xl sm:rounded-xl
          shadow-2xl
          flex flex-col
          max-h-[90vh] sm:max-h-[85vh]
          animate-in sm:fade-in-0 sm:zoom-in-95
          slide-in-from-bottom-4 sm:slide-in-from-bottom-0
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-slate-200 shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2
              id={titleId}
              className="text-lg font-semibold text-slate-900 truncate"
            >
              {title}
            </h2>
            {description && (
              <p id={descId} className="text-sm text-slate-500 mt-0.5">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="
                shrink-0 w-8 h-8 p-0 rounded-full
                text-slate-400 hover:text-slate-600
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
              "
              aria-label="Tutup dialog"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 p-4 sm:p-6 border-t border-slate-200 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}

// ============================================================
// ConfirmModal — Pre-built confirmation dialog
// ============================================================
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "default",
  loading = false,
}: ConfirmModalProps) {
  const variantStyles = {
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    default: "bg-blue-600 hover:bg-blue-700 text-white",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={variantStyles[variant]}
          >
            {loading ? "Memproses..." : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
