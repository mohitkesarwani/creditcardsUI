import React from 'react';

function Loader({ message = 'Loading...' }) {
  return (
    <div className="flex justify-center items-center py-10" data-testid="loader">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-start mr-2" />
      <span className="text-brand-start font-medium">{message}</span>
    </div>
  );
}

export default Loader;
