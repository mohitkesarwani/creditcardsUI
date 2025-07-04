import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpTrayIcon,
  ClipboardIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { WhatsAppIcon, FacebookIcon, LinkedinIcon } from './BrandIcons';
import { useToast } from '../hooks/useToast';

interface Props {
  productId: string;
  productType: string;
  count: number;
  onShared?: () => void;
}

export default function ShareMenu({ productId, productType, count, onShared }: Props) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLButtonElement[]>([]);
  const toast = useToast();
  const url = `${window.location.origin}/${productType}/${productId}`;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKey);
      setFocusIndex(0);
      setTimeout(() => itemRefs.current[0]?.focus(), 0);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const handleShare = (platform: string) => {
    let target = '';
    const shareUrl = `${url}${url.includes('?') ? '&' : '?'}utm_source=${platform}&utm_medium=share`;
    const text = encodeURIComponent(shareUrl);
    const shareEncoded = encodeURIComponent(shareUrl);
    switch (platform) {
      case 'whatsapp':
        target = `https://wa.me/?text=${text}`;
        break;
      case 'facebook':
        target = `https://www.facebook.com/sharer/sharer.php?u=${shareEncoded}`;
        break;
      case 'linkedin':
        target = `https://www.linkedin.com/shareArticle?mini=true&url=${shareEncoded}`;
        break;
    }
    window.open(target, '_blank');
    if (window.gtag) {
      window.gtag('event', 'Share Clicked', {
        method: platform,
        productId,
        page: productType === 'home-loans' ? 'HomeLoans' : 'CreditCards',
      });
    }
    if (onShared) onShared();
    setOpen(false);
  };

  const handleCopy = async () => {
    const link = `${url}${url.includes('?') ? '&' : '?'}utm_source=copy&utm_medium=share`;
    try {
      await navigator.clipboard.writeText(link);
      toast('success', 'Link copied to clipboard!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (window.gtag) {
        window.gtag('event', 'Share Clicked', {
          method: 'copy',
          productId,
          page: productType === 'home-loans' ? 'HomeLoans' : 'CreditCards',
        });
      }
      if (onShared) onShared();
    } catch (err) {
      toast('error', 'Copy failed');
    }
    setOpen(false);
  };

  const handleMenuKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const total = itemRefs.current.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (focusIndex + 1) % total;
      setFocusIndex(next);
      itemRefs.current[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (focusIndex + total - 1) % total;
      setFocusIndex(prev);
      itemRefs.current[prev]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      itemRefs.current[focusIndex]?.click();
    }
  };

  const btnCls =
    'flex items-center gap-1 rounded-full p-1 bg-white/70 shadow hover:bg-[#007aff]/20 text-gray-700 transition';
  const menuItemCls =
    'flex items-center w-full gap-2 px-3 py-2 hover:bg-sky-50 active:bg-sky-100 rounded-md text-left transition-colors min-h-[44px]';

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Share this product"
        className={btnCls}
      >
        <ArrowUpTrayIcon className="w-5 h-5" /> {count}
      </button>
      {open && (
        <>
          {isMobile && <div className="fixed inset-0 bg-black/20 z-20" />}
          <div
            className={`${
              isMobile
                ? 'fixed inset-x-0 bottom-0 mx-4 mb-4'
                : 'absolute right-0 mt-1'
            } bg-gradient-to-b from-[#0066cc] to-[#e0f0ff] rounded-xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.08)] z-30 text-sm`}
            role="menu"
            aria-label="Share Options"
            onKeyDown={handleMenuKey}
          >
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <span className="font-semibold text-base">Share This Card</span>
              {isMobile && (
                <button onClick={() => setOpen(false)} aria-label="Close share menu">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              ref={(el) => (itemRefs.current[0] = el!)}
              className={menuItemCls + ' ripple group'}
              onClick={() => handleShare('whatsapp')}
              role="menuitem"
            >
              <WhatsAppIcon className="w-5 h-5 text-[#25D366] transition-transform group-hover:scale-110" />
              <span className="font-medium text-[14px]">WhatsApp</span>
            </button>
            <button
              ref={(el) => (itemRefs.current[1] = el!)}
              className={menuItemCls + ' ripple group'}
              onClick={() => handleShare('facebook')}
              role="menuitem"
            >
              <FacebookIcon className="w-5 h-5 text-[#1877F2] transition-transform group-hover:scale-110" />
              <span className="font-medium text-[14px]">Facebook</span>
            </button>
            <button
              ref={(el) => (itemRefs.current[2] = el!)}
              className={menuItemCls + ' ripple group'}
              onClick={() => handleShare('linkedin')}
              role="menuitem"
            >
              <LinkedinIcon className="w-5 h-5 text-[#0A66C2] transition-transform group-hover:scale-110" />
              <span className="font-medium text-[14px]">LinkedIn</span>
            </button>
            <button
              ref={(el) => (itemRefs.current[3] = el!)}
              className={menuItemCls + ' ripple group relative'}
              onClick={handleCopy}
              role="menuitem"
            >
              <ClipboardIcon className="w-5 h-5 text-[#666] transition-transform group-hover:scale-110" />
              <span className="font-medium text-[14px]">Copy Link</span>
              {copied && (
                <span className="absolute right-2 -top-2 bg-gray-800 text-white text-xs px-2 py-0.5 rounded opacity-0 animate-fade-up">
                  Copied!
                </span>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
