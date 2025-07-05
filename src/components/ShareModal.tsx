import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useToast } from '../hooks/useToast';

interface Summary {
  image?: string;
  name: string;
  rate?: string | number | null;
  annualFee?: string | number | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onShare: (text: string) => Promise<any> | void;
  header: string;
  summary: Summary;
}

export default function ShareModal({ open, onClose, onShare, header, summary }: Props) {
  const [text, setText] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => closeButtonRef.current?.focus(), 0);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && overlayRef.current) {
        const nodes = overlayRef.current.querySelectorAll<HTMLElement>(
          'button,textarea'
        );
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handlePost = async () => {
    await onShare(text);
    toast('success', 'Shared successfully!');
    setText('');
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          className="bg-white rounded-2xl shadow-md p-4 w-full max-w-sm mx-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{header}</h2>
            <button ref={closeButtonRef} onClick={onClose} aria-label="Close">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-3 mb-4 text-sm">
            {summary.image && (
              <img
                src={summary.image}
                alt={summary.name}
                className="w-16 h-16 object-contain rounded"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== '/assets/image-not-available.svg') {
                    target.src = '/assets/image-not-available.svg';
                  }
                }}
              />
            )}
            <div>
              <p className="font-semibold">{summary.name}</p>
              {summary.rate !== undefined && summary.rate !== null && (
                <p>Rate: {summary.rate}</p>
              )}
              {summary.annualFee !== undefined && summary.annualFee !== null && (
                <p>Annual Fee: {summary.annualFee}</p>
              )}
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="What do you want to say about this card?"
            className="w-full border rounded p-2 text-sm mb-4 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="border rounded px-4 py-1 text-sm">
              Cancel
            </button>
            <button
              onClick={handlePost}
              className="bg-blue-600 text-white rounded px-4 py-1 text-sm"
            >
              Post
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
