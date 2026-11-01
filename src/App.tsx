import { useState, useEffect } from 'react';
import { WorldGenScreen } from './components/worldgen/WorldGenScreen';
import { MainMenu } from './components/game/MainMenu';
import { SpawnPointSection } from './components/game/SpawnPointSection';
import { soundManager } from './utils/sound';
import { DIRT_TEXTURE_URI } from './utils/textures';
import './components/game/game.css';

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<string>('menu');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

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

          {activeSection === 'spawn' && (
            <SpawnPointSection
              onBack={() => handleNavigate('menu')}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
            />
          )}
        </main>
      )}
    </div>
  );
}
