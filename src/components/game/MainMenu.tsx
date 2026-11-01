import React, { useState, useEffect } from 'react';
import { soundManager } from '../../utils/sound';
import { Volume2, VolumeX, Compass } from 'lucide-react';

interface MainMenuProps {
  onNavigate: (section: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const SPLASH_MESSAGES = [
  'This surely was not "Tippe"...',
  'Who loves that "Special Uppitt"...',
  'A little piece of HackFusion!',
  'Kash Who "Shawarma" mil jaata...',
  'Inna 10 Boxes Bek!!!'
];

export const MainMenu: React.FC<MainMenuProps> = ({
  onNavigate,
  soundEnabled,
  onToggleSound,
}) => {
  const [splashIndex, setSplashIndex] = useState(0);

  // Automatically cycle through splash messages every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSplashIndex((prev) => (prev + 1) % SPLASH_MESSAGES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Clicking splash cycles to next message manually with 8-bit sound
  const handleSplashClick = () => {
    soundManager.playBlipSound();
    setSplashIndex((prev) => (prev + 1) % SPLASH_MESSAGES.length);
  };

  const handleButtonClick = (section: string) => {
    soundManager.playButtonClick();
    onNavigate(section);
  };

  return (
    <div className="mc-home-wrapper">
      {/* Centered Main Menu Content */}
      <div className="mc-main-menu-container">
        {/* Title Block with 3D shadow and bouncing yellow splash */}
        <header className="mc-title-box">
          <h1 className="mc-main-title">
            HACKFUSION 2.0
          </h1>
          {/* Interactive Bouncing Minecraft Splash Text */}
          <div
            className="mc-splash-text"
            onClick={handleSplashClick}
            role="button"
            tabIndex={0}
            title="Click to cycle splash text!"
            aria-label={`Splash text: ${SPLASH_MESSAGES[splashIndex]}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSplashClick();
              }
            }}
          >
            {SPLASH_MESSAGES[splashIndex]}
          </div>
        </header>
        <br />
        <br />
        <br />

        {/* Subtitle */}
        <p className="mc-subtitle">
          OUR ADVENTURE. OUR PEOPLE. OUR MEMORIES.
        </p>

        <br />
        <br />

        {/* Main Menu Button Options */}
        <nav className="mc-menu-options" aria-label="Main menu navigation">
          <button
            type="button"
            className="mc-menu-btn secondary-highlight"
            onClick={() => handleButtonClick('spawn')}
          >
            <span>ENTER MEMORY WORLD</span>
            <span className="mc-btn-tag">SPAWN</span>
          </button>
        </nav>
      </div>

      {/* Bottom Pinned Footer Bar */}
      <footer className="mc-home-bottom-bar">
        <button
          type="button"
          className="mc-stone-btn"
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {soundEnabled ? (
            <>
              <Volume2 size={13} aria-hidden="true" />
              <span>SFX: ON</span>
            </>
          ) : (
            <>
              <VolumeX size={13} aria-hidden="true" />
              <span>SFX: OFF</span>
            </>
          )}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={12} color="#38bdf8" aria-hidden="true" />
          <span>HackFusion 2.0 • The Software Society</span>
        </div>
      </footer>
    </div>
  );
};
