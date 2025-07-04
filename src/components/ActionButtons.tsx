import React from 'react';

interface ActionButtonsProps {
  onCompare?: () => void;
  onDetails?: () => void;
  onApply?: () => void;
  applyHref?: string;
  showCompare?: boolean;
  showDetails?: boolean;
  showApply?: boolean;
}

export default function ActionButtons({
  onCompare,
  onDetails,
  onApply,
  applyHref,
  showCompare = true,
  showDetails = true,
  showApply = true,
}: ActionButtonsProps) {
  return (
    <div className="mt-4 mb-2 w-full flex flex-col items-center">
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        {showCompare && (
          <button
            type="button"
            onClick={onCompare}
            className="btn btn-secondary text-sm flex-1"
          >
            Compare
          </button>
        )}
        {showDetails && (
          <button
            type="button"
            onClick={onDetails}
            className="btn btn-secondary text-sm flex-1"
          >
            Details
          </button>
        )}
      </div>
      {showApply && (
        <a
          href={applyHref}
          onClick={onApply}
          target={applyHref ? '_blank' : undefined}
          rel={applyHref ? 'noopener noreferrer' : undefined}
          className="mt-2 btn btn-primary w-full flex items-center justify-center gap-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-8 8a1 1 0 01-.707.293H5a1 1 0 01-1-1v-4a1 1 0 01.293-.707l8-8z" />
            <path d="M11 3l6 6" stroke="#fff" strokeWidth="2" />
          </svg>
          Apply Now
        </a>
      )}
    </div>
  );
}
