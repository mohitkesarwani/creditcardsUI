import React from 'react';

const logos = [
  { name: 'AMP', url: 'https://via.placeholder.com/120x40?text=AMP' },
  { name: 'ANZ', url: 'https://via.placeholder.com/120x40?text=ANZ' },
  { name: 'CBA', url: 'https://via.placeholder.com/120x40?text=CBA' },
  { name: 'NAB', url: 'https://via.placeholder.com/120x40?text=NAB' },
  { name: 'Westpac', url: 'https://via.placeholder.com/120x40?text=Westpac' },
];

function TrustedBySection() {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-center mb-6">Trusted by Australians & Industry Leaders</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {logos.map((logo) => (
          <img
            key={logo.name}
            src={logo.url}
            alt={logo.name}
            className="h-10 grayscale hover:grayscale-0 transition"
          />
        ))}
      </div>
    </section>
  );
}

export default TrustedBySection;
