import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpTrayIcon, ClipboardIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { WhatsAppIcon, FacebookIcon, LinkedinIcon } from './BrandIcons';
import { useToast } from '../hooks/useToast';

interface Props {
  url: string;
  count: number;
  onShared?: () => void;
}

export default function ShareButton({ url, count, onShared }: Props) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

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
    if (onShared) onShared();
    setOpen(false);
  };

  const handleCopy = async () => {
    const link = `${url}${url.includes('?') ? '&' : '?'}utm_source=copy&utm_medium=share`;
    try {
      await navigator.clipboard.writeText(link);
      toast('success', 'Link copied to clipboard!');
      if (onShared) onShared();
    } catch (err) {
      toast('error', 'Copy failed');
    }
    setOpen(false);
  };

  const btnCls =
    'flex items-center gap-1 rounded-full p-1 bg-white/70 shadow hover:bg-[#007aff]/20 text-gray-700 transition';
  const menuItemCls =
    'flex items-center w-full gap-2 px-3 py-2 hover:bg-[#edf6ff] rounded-md text-left';

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
            } bg-gradient-to-br from-[#e6f0fa] to-[#c9e0f5] border border-black/10 rounded-xl shadow-inner backdrop-blur-sm p-3 z-30 text-sm`}
          >
            <div className="flex items-center justify-between mb-2 border-b pb-1">
              <span className="font-semibold text-sm">Share this card</span>
              {isMobile && (
                <button onClick={() => setOpen(false)} aria-label="Close share menu">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            <button className={menuItemCls} onClick={() => handleShare('whatsapp')}>
              <WhatsAppIcon className="w-4 h-4 text-green-600" /> WhatsApp
            </button>
            <button className={menuItemCls} onClick={() => handleShare('facebook')}>
              <FacebookIcon className="w-4 h-4 text-blue-600" /> Facebook
            </button>
            <button className={menuItemCls} onClick={() => handleShare('linkedin')}>
              <LinkedinIcon className="w-4 h-4 text-blue-700" /> LinkedIn
            </button>
            <button className={menuItemCls} onClick={handleCopy}>
              <ClipboardIcon className="w-4 h-4" /> Copy Link
            </button>
          </div>
        </>
      )}
    </div>
  );
}
