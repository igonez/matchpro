'use client';

import React from 'react';
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
  if (!isOpen) return null;

  const resolvedConfirmLabel = confirmText || confirmLabel || 'Confirmar';
  const resolvedCancelLabel = cancelText || cancelLabel || (onConfirm ? 'Cancelar' : 'Fechar');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="mono-glass-card max-w-md w-full p-6 sm:p-7 rounded-3xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative space-y-5 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Cabeçalho */}
        <div className="flex items-start justify-between pb-3 border-b border-white/[0.08]">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block mb-0.5">
              {tag}
            </span>
            <h3 className="text-base sm:text-lg font-black text-white font-mono tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Conteúdo Dinâmico */}
        {children && <div className="space-y-4">{children}</div>}

        {/* Ações */}
        {!hideFooter && (
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
            {onConfirm ? (
              <>
                {resolvedCancelLabel && (
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="mono-button-secondary px-4 py-2 text-xs font-mono"
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
                      ? 'px-5 py-2 text-xs font-mono font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-colors'
                      : 'mono-button-primary px-5 py-2 text-xs font-mono font-bold'
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
                className="mono-button-primary px-5 py-2 text-xs font-mono font-bold"
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
