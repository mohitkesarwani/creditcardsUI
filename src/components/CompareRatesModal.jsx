import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPercent } from '../utils.js';

function CompareRatesModal({ open, onClose, rates = [] }) {
  const overlayRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          className="bg-white max-w-lg w-full rounded shadow-lg p-4 relative text-gray-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
            aria-label="Close"
          >
            &times;
          </button>
          <h3 className="text-lg font-bold mb-4">Compare Rates</h3>
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">Purpose</th>
                  <th className="border px-2 py-1 text-left">Repayment</th>
                  <th className="border px-2 py-1 text-left">Rate Type</th>
                  <th className="border px-2 py-1 text-left">Rate</th>
                  <th className="border px-2 py-1 text-left">Comparison</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r, i) => (
                  <tr key={i} className="even:bg-gray-50">
                    <td className="border px-2 py-1">{r.loanPurpose || 'N/A'}</td>
                    <td className="border px-2 py-1">{r.repaymentType || 'N/A'}</td>
                    <td className="border px-2 py-1">{r.rateType || r.lendingRateType || 'N/A'}</td>
                    <td className="border px-2 py-1">{r.rate ? formatPercent(r.rate) : 'N/A'}</td>
                    <td className="border px-2 py-1">{r.comparisonRate ? formatPercent(r.comparisonRate) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default CompareRatesModal;
