import React, { useState } from 'react';
import { ArrowUpTrayIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { useToast } from '../hooks/useToast';

interface Props {
  url: string;
  count: number;
  onShared?: () => void;
}

export default function ShareButton({ url, count, onShared }: Props) {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  const encodedUrl = encodeURIComponent(url);

  const handleShare = (platform: string) => {
    let target = '';
    const text = encodeURIComponent(url);
    switch (platform) {
      case 'whatsapp':
        target = `https://wa.me/?text=${text}`;
        break;
      case 'facebook':
        target = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        target = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}`;
        break;
    }
    window.open(target, '_blank');
    if (onShared) onShared();
    setOpen(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast('success', 'Copied!');
      if (onShared) onShared();
    } catch (err) {
      toast('error', 'Copy failed');
    }
    setOpen(false);
  };

  const btnCls = 'flex items-center gap-1 hover:text-blue-500 transition';
  const menuItemCls =
    'flex items-center w-full gap-2 px-2 py-1 hover:bg-gray-50 text-left';

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Share this product"
        className={btnCls}
      >
        <ArrowUpTrayIcon className="w-5 h-5" /> {count}
      </button>
      {open && (
        <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10 text-sm">
          <button className={menuItemCls} onClick={() => handleShare('whatsapp')}>
            <span>WhatsApp</span>
          </button>
          <button className={menuItemCls} onClick={() => handleShare('facebook')}>
            <span>Facebook</span>
          </button>
          <button className={menuItemCls} onClick={() => handleShare('linkedin')}>
            <span>LinkedIn</span>
          </button>
          <button className={menuItemCls} onClick={handleCopy}>
            <ClipboardIcon className="w-4 h-4" /> Copy Link
          </button>
        </div>
      )}
    </div>
  );
}
