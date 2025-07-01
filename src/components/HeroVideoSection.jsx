import React from 'react';
import './HeroVideoSection.css';

function HeroVideoSection() {
  return (
    <section className="hero-video-container">
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="hero-video-overlay" />
      <h1 className="hero-video-heading fade-in">Clarity In Every Comparison</h1>
    </section>
  );
}

export default HeroVideoSection;
