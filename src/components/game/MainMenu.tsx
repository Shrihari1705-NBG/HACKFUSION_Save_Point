import React, { useState, useEffect } from 'react';
import { soundManager } from '../../utils/sound';
import { Volume2, VolumeX, Compass } from 'lucide-react';
import type { PlayerProfile } from '../../App';

interface MainMenuProps {
  onNavigate: (section: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  playerProfile?: PlayerProfile;
  onSaveProfile?: (profile: PlayerProfile) => void;
}

const SPLASH_MESSAGES = [
  'This surely was not "Tippe"...',
  'Who loves that "Special Uppitt"...',
  'A Little Piece Of HackFusion!',
  'Kash Who "Shawarma" mil jaata...',
  'Inna 10 Boxes Bek!!!',
  'Food Coupan sakaata?',
  'kya Bhaiyaaaa...'
];

const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'];

export const MainMenu: React.FC<MainMenuProps> = ({
  onNavigate,
  soundEnabled,
  onToggleSound,
  playerProfile,
  onSaveProfile,
}) => {
  // Start with 'A Little Piece Of HackFusion!' to match the design reference
  const [splashIndex, setSplashIndex] = useState(2);

  // Initialize from playerProfile, localStorage, or sessionStorage
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return (
        playerProfile?.name ||
        localStorage.getItem('hackfusion_player_name') ||
        sessionStorage.getItem('hackfusion_player_name') ||
        ''
      );
    } catch {
      return '';
    }
  });

  const [playerGender, setPlayerGender] = useState<string>(() => {
    try {
      return (
        playerProfile?.gender ||
        localStorage.getItem('hackfusion_player_gender') ||
        sessionStorage.getItem('hackfusion_player_gender') ||
        ''
      );
    } catch {
      return '';
    }
  });

  // Automatically cycle through splash messages every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSplashIndex((prev) => (prev + 1) % SPLASH_MESSAGES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Persist name & gender whenever either changes
  useEffect(() => {
    if (playerName.trim() || playerGender) {
      try {
        if (playerName.trim()) {
          localStorage.setItem('hackfusion_player_name', playerName.trim());
          sessionStorage.setItem('hackfusion_player_name', playerName.trim());
        }
        if (playerGender) {
          localStorage.setItem('hackfusion_player_gender', playerGender);
          sessionStorage.setItem('hackfusion_player_gender', playerGender);
        }
      } catch {
        // ignore storage errors
      }
    }
  }, [playerName, playerGender]);

  // Clicking splash cycles to next message manually with 8-bit sound
  const handleSplashClick = () => {
    soundManager.playBlipSound();
    setSplashIndex((prev) => (prev + 1) % SPLASH_MESSAGES.length);
  };

  // Cycle gender on click (authentic Minecraft settings button interaction)
  const handleCycleGender = () => {
    soundManager.playButtonClick();
    setPlayerGender((prev) => {
      if (!prev) return GENDER_OPTIONS[0];
      const idx = GENDER_OPTIONS.indexOf(prev);
      if (idx === -1 || idx === GENDER_OPTIONS.length - 1) {
        return GENDER_OPTIONS[0];
      }
      return GENDER_OPTIONS[idx + 1];
    });
  };

  const isReadyToEnter = playerName.trim().length > 0 && Boolean(playerGender);

  const handleEnterWorld = () => {
    if (!isReadyToEnter) return;
    soundManager.playButtonClick();

    const profile: PlayerProfile = {
      name: playerName.trim(),
      gender: playerGender,
    };

    try {
      localStorage.setItem('hackfusion_player_name', profile.name);
      localStorage.setItem('hackfusion_player_gender', profile.gender);
      sessionStorage.setItem('hackfusion_player_name', profile.name);
      sessionStorage.setItem('hackfusion_player_gender', profile.gender);
    } catch {
      // ignore
    }

    if (onSaveProfile) {
      onSaveProfile(profile);
    }

    onNavigate('spawn');
  };

  return (
    <div className="mc-home-wrapper">
      {/* Centered Main Menu Content */}
      <div className="mc-main-menu-container">
        {/* Title Block with 3D shadow and bouncing yellow splash */}
        <header className="mc-title-box">
          <div className="mc-title-group">
            <h1 className="mc-title-brand">HACKFUSION</h1>
            <div className="mc-title-sub-row">
              <span className="mc-title-version">2.0</span>
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
            </div>
          </div>
        </header>

        {/* Subtitle */}
        <p className="mc-subtitle">
          OUR ADVENTURE. OUR PEOPLE. OUR MEMORIES
        </p>

        {/* Inputs Section */}
        <div className="mc-profile-form">
          {/* Box 1: ENTER YOUR NAME: ------ */}
          <div className="mc-input-box">
            <label htmlFor="mc-player-name" className="mc-input-label">
              ENTER YOUR NAME:&nbsp;
            </label>
            <input
              id="mc-player-name"
              type="text"
              className="mc-text-input"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="------"
              maxLength={20}
              autoComplete="off"
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (isReadyToEnter) {
                    handleEnterWorld();
                  } else if (!playerGender) {
                    handleCycleGender();
                  }
                }
              }}
            />
          </div>

          {/* Box 2: SELECT GENDER: ------ */}
          <div
            className="mc-input-box mc-gender-box"
            onClick={handleCycleGender}
            role="button"
            tabIndex={0}
            title="Click to select gender (cycles: MALE / FEMALE / OTHER)"
            aria-label={`Select gender. Currently: ${playerGender || 'unselected'}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCycleGender();
              }
            }}
          >
            <span className="mc-input-label">SELECT GENDER:&nbsp;</span>
            <span className={`mc-gender-value ${!playerGender ? 'is-empty' : ''}`}>
              {playerGender || '------'}
            </span>
            {/* Native dropdown overlay for multi-platform accessibility */}
            <select
              className="mc-gender-select-dropdown"
              value={playerGender}
              onChange={(e) => {
                e.stopPropagation();
                soundManager.playButtonClick();
                setPlayerGender(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label="Select Gender option"
            >
              <option value="" disabled>------</option>
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
            </select>
          </div>

          {/* Enter the World Button appears once Name and Gender are entered */}
          {isReadyToEnter ? (
            <nav className="mc-menu-options" aria-label="Main menu navigation" style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                className="mc-menu-btn mc-enter-world-btn"
                onClick={handleEnterWorld}
                aria-label="Enter the World"
              >
                ENTER THE WORLD ➔
              </button>
            </nav>
          ) : (
            <div className="mc-enter-hint" aria-live="polite">
              {!playerName.trim() && !playerGender
                ? 'ENTER YOUR NAME & SELECT GENDER TO PROCEED'
                : !playerName.trim()
                ? 'ENTER YOUR NAME TO PROCEED'
                : 'SELECT GENDER TO PROCEED'}
            </div>
          )}
        </div>
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
