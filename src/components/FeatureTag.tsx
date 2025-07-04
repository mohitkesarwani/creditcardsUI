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
    'inline-flex items-center px-4 py-1.5 text-sm font-medium rounded-full';
  const inactiveStyles = 'bg-[#f0f0f0] text-gray-800 hover:shadow hover:border-gray-300 border border-transparent';
  const activeStyles = 'bg-primary text-white border border-primary';

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
