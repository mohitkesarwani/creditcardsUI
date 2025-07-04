import React from 'react';

interface FeatureTagProps extends React.HTMLAttributes<HTMLElement> {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  isClickable?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export default function FeatureTag({
  label,
  selected = false,
  onClick,
  isClickable = false,
  className = '',
  icon,
  ...rest
}: FeatureTagProps) {
  const clickable = isClickable || typeof onClick === 'function';
  const base =
    'inline-flex items-center px-[14px] py-[6px] text-sm font-medium rounded-full shadow-sm';
  const inactiveStyles = 'bg-[#f2f4f7] text-[#1a1a1a] hover:bg-gray-200';
  const activeStyles = 'bg-primary-blue text-white';

  const cls = `${base} ${selected ? activeStyles : inactiveStyles} ${
    clickable ? 'cursor-pointer transition' : ''
  } ${className}`.trim();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!clickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick && onClick();
    }
  };

  const SpanTag = clickable ? 'button' : 'span';

  return (
    <SpanTag
      type={clickable ? 'button' : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-pressed={clickable ? selected : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      className={cls}
      {...rest}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </SpanTag>
  );
}
