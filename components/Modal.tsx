'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, AlertCircle, Sparkles, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, icon = 'school', children }: ModalProps) {
  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getIconElement = () => {
    switch (icon) {
      case 'help_outline':
      case 'help':
        return <HelpCircle className="w-6 h-6 text-indigo-400" id="icon-help" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-rose-400" id="icon-alert" />;
      case 'psychology':
      case 'auto_awesome':
        return <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" id="icon-ai" />;
      case 'celebration':
        return <Info className="w-6 h-6 text-emerald-400" id="icon-celebrate" />;
      default:
        return <Info className="w-6 h-6 text-indigo-400" id="icon-default" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/85 backdrop-blur-md transition-all duration-300 select-none">
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg overflow-hidden border glass-panel bg-slate-900 border-slate-800 rounded-3xl p-6 shadow-2xl z-10 text-right"
            dir="rtl"
          >
            {/* Close Button Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 transition-colors"
              title="بستن"
              id="modal-close-btn"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-950 pb-3 mb-4 select-none">
              <div className="p-1.5 bg-indigo-500/10 rounded-xl" id="modal-decor-icon">
                {getIconElement()}
              </div>
              <h3 className="text-sm font-black text-white" id="modal-title-header">{title}</h3>
            </div>

            {/* Content Area */}
            <div className="text-xs text-slate-300 leading-relaxed font-sans font-medium" id="modal-content-area">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
