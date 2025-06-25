import React, { useEffect } from 'react';

function AdBanner() {
  const client = import.meta.env.VITE_ADSENSE_CLIENT;
  const slot = import.meta.env.VITE_ADSENSE_SLOT;

  useEffect(() => {
    if (window.adsbygoogle && client && slot) {
      window.adsbygoogle.push({});
    }
  }, [client, slot]);

  if (!client || !slot) {
    return null;
  }

  return (
    <div className="my-4 flex justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}

export default AdBanner;
