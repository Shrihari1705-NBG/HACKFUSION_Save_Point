import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { WorldGenScreen } from './components/worldgen/WorldGenScreen';
import { MainMenu } from './components/game/MainMenu';
import { SpawnPointSection } from './components/game/SpawnPointSection';
import { BonusChestGame } from './components/game/BonusChestGame';
import { soundManager } from './utils/sound';
import { DIRT_TEXTURE_URI } from './utils/textures';
import './components/game/game.css';

const WORLD_TITLES: Record<string, string> = {
  w1: 'DECORATION AND PREP',
  w2: 'FRIDAY MORNING',
  w3: 'JAMMING NIGHT',
  w4: 'END MEMORIES',
};

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<string>('menu');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeWorldId, setActiveWorldId] = useState<string | null>(null);

  // Dynamic unlocked worlds, persisted across sessions
  const [unlockedWorlds, setUnlockedWorlds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hackfusion_unlocked_worlds');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return ['w1'];
  });

  // Prevent drag on images globally
  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener('dragstart', handleDragStart);
    return () => {
      window.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundManager.enabled = nextState;
    if (nextState) {
      soundManager.playButtonClick();
    }
  };

  const handleWorldGenComplete = () => {
    setIsLoading(false);
  };

  const handleNavigate = (section: string) => {
    soundManager.playButtonClick();
    setActiveSection(section);
    // Reset active world when navigating away from spawn
    if (section !== 'spawn') {
      setActiveWorldId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Unlocks next and returns directly to the Select World page
  const handleUnlockNext = () => {
    soundManager.playSavePointSound();
    try {
      confetti({
        particleCount: 40,
        spread: 65,
        colors: ['#38bdf8', '#fb7185', '#facc15', '#4ade80', '#ffffff'],
        shapes: ['square'],
      });
    } catch {
      // ignore
    }

    // Go directly to the Select World page
    setActiveWorldId(null);
    setActiveSection('spawn');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="mc-game-viewport mc-dirt-bg"
      style={{
        backgroundImage: `url("${DIRT_TEXTURE_URI}")`,
      }}
    >
      {/* Dark Ambient Vignette Layer */}
      <div className="mc-vignette-overlay" aria-hidden="true" />

      {/* World Generation Screen (The Minecraft Java 1.16 loader) */}
      {isLoading && (
        <WorldGenScreen
          onComplete={handleWorldGenComplete}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
      )}

      {/* Main Experience Render Area */}
      {!isLoading && (
        <main style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeSection === 'menu' && (
            <MainMenu
              onNavigate={handleNavigate}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
            />
          )}

          {/* Only w1 (Decoration and Prep) has the bonus chest game. w2, w3, w4 stay locked & empty */}
          {activeSection === 'spawn' && activeWorldId === 'w1' && (
            <BonusChestGame
              worldId="w1"
              worldTitle={WORLD_TITLES.w1}
              onBack={() => setActiveWorldId(null)}
              onUnlockNext={handleUnlockNext}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
            />
          )}

          {activeSection === 'spawn' && activeWorldId !== 'w1' && (
            <SpawnPointSection
              onBack={() => handleNavigate('menu')}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
              onPlayWorld={(id) => {
                if (id === 'w1') {
                  setActiveWorldId('w1');
                }
              }}
            />
          )}
        </main>
      )}
    </div>
  );
}
