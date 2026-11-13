'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm?: () => void;
  isLoading?: boolean;
  hideFooter?: boolean;
  tag?: string;
}

export function CustomDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  confirmText,
  cancelText,
  variant = 'default',
  onConfirm,
  isLoading = false,
  hideFooter = false,
  tag = 'SISTEMA_DIALOG',
}: CustomDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const resolvedConfirmLabel = confirmText || confirmLabel || 'Confirmar';
  const resolvedCancelLabel = cancelText || cancelLabel || (onConfirm ? 'Cancelar' : 'Fechar');

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#000000]/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-dialog-title"
        className="mono-glass-card max-w-md w-full p-6 sm:p-7 rounded-3xl border border-[#27272A] bg-[#0E0E10] shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
      >
        
        {/* Cabeçalho */}
        <div className="flex items-start justify-between pb-3 border-b border-[#27272A]">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#A1A1AA] block mb-0.5">
              {tag}
            </span>
            <h3 id="custom-dialog-title" className="text-base sm:text-lg font-black text-[#FAFAFA] font-mono tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-[#A1A1AA] mt-1 font-sans leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-full bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[#3478F6]/40 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Conteúdo Dinâmico */}
        {children && <div className="space-y-4">{children}</div>}

        {/* Ações */}
        {!hideFooter && (
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#27272A]">
            {onConfirm ? (
              <>
                {resolvedCancelLabel && (
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="mono-button-secondary px-4 py-2 min-h-[44px] text-xs font-mono"
                  >
                    {resolvedCancelLabel}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={
                    variant === 'destructive'
                      ? 'px-5 py-2 min-h-[44px] text-xs font-mono font-bold rounded-xl bg-rose-500/20 border border-rose-500/40 hover:bg-rose-500/30 text-rose-200 transition-colors'
                      : 'mono-button-primary px-5 py-2 min-h-[44px] text-xs font-mono font-bold'
                  }
                >
                  {isLoading ? 'PROCESSANDO...' : resolvedConfirmLabel}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="mono-button-primary px-5 py-2 min-h-[44px] text-xs font-mono font-bold"
              >
                {confirmText || confirmLabel || resolvedCancelLabel}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
