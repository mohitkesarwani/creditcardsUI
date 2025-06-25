import React from 'react';

function SectionHeader({ title, subtitle }) {
  return (
    <div className="text-center">
      <h2 className="section-heading">{title}</h2>
      {subtitle && <p className="section-subtext mt-2">{subtitle}</p>}
    </div>
  );
}

export default SectionHeader;
