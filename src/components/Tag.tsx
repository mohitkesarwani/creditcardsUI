import React from 'react';

interface TagProps extends React.HTMLAttributes<HTMLElement> {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  isClickable?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export default function Tag({
  label,
  selected = false,
  onClick,
  isClickable = false,
  className = '',
  icon,
  ...rest
}: TagProps) {
  const clickable = isClickable || typeof onClick === 'function';
  const base =
    'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full';
  const inactiveStyles = 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  const activeStyles = 'bg-blue-600 text-white';

  const cls = `${base} ${selected ? activeStyles : inactiveStyles} ${
    clickable ? 'cursor-pointer transition-all' : ''
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
