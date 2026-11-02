import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { WorldGenScreen } from './components/worldgen/WorldGenScreen';
import { MainMenu } from './components/game/MainMenu';
import { SpawnPointSection } from './components/game/SpawnPointSection';
import { BonusChestGame } from './components/game/BonusChestGame';
import { FridayMorningQuest } from './components/game/FridayMorningQuest';
import { assetPreloader, WORLD_2_MANIFEST } from './utils/assetPreloader';
import { soundManager } from './utils/sound';
import { DIRT_TEXTURE_URI } from './utils/textures';
import './components/game/game.css';

export interface PlayerProfile {
  name: string;
  gender: string;
}

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

  // Unlocked worlds state: World 1 & 2 enabled, last 2 (w3, w4) locked for now
  // Stats reset so user can test fresh
  const [unlockedWorlds, setUnlockedWorlds] = useState<string[]>(() => {
    try {
      localStorage.setItem('hackfusion_unlocked_worlds', JSON.stringify(['w1', 'w2']));
    } catch {
      // fallback
    }
    return ['w1', 'w2'];
  });

  // Preload World 2 components and assets in background while exploring the first level (w1)
  useEffect(() => {
    if (activeWorldId === 'w1' || activeSection === 'spawn' || !isLoading) {
      assetPreloader.preloadManifest(WORLD_2_MANIFEST);
    }
  }, [activeWorldId, activeSection, isLoading]);

  // Player profile state (saved across visit)
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => {
    try {
      const savedName =
        localStorage.getItem('hackfusion_player_name') ||
        sessionStorage.getItem('hackfusion_player_name') ||
        '';
      const savedGender =
        localStorage.getItem('hackfusion_player_gender') ||
        sessionStorage.getItem('hackfusion_player_gender') ||
        '';
      return { name: savedName, gender: savedGender };
    } catch {
      return { name: '', gender: '' };
    }
  });

  const handleSaveProfile = (profile: PlayerProfile) => {
    setPlayerProfile(profile);
    try {
      localStorage.setItem('hackfusion_player_name', profile.name);
      localStorage.setItem('hackfusion_player_gender', profile.gender);
      sessionStorage.setItem('hackfusion_player_name', profile.name);
      sessionStorage.setItem('hackfusion_player_gender', profile.gender);
    } catch {
      // ignore
    }
  };

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

  // Completion of World 1 (Decoration and Prep) unlocks World 2 (Friday Morning)
  const handleUnlockWorld2 = () => {
    soundManager.playSavePointSound();
    setUnlockedWorlds((prev) => {
      const next = Array.from(new Set([...prev, 'w2']));
      try {
        localStorage.setItem('hackfusion_unlocked_worlds', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    try {
      confetti({
        particleCount: 45,
        spread: 65,
        colors: ['#38bdf8', '#fb7185', '#facc15', '#4ade80', '#ffffff'],
        shapes: ['square'],
      });
    } catch {
      // ignore
    }

    // Return to the Select World page where World 2 is now unlocked!
    setActiveWorldId(null);
    setActiveSection('spawn');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Completion of World 2 (Friday Morning) - returns to Select World (last 2 locked for now)
  const handleUnlockWorld3 = () => {
    soundManager.playSavePointSound();

    try {
      confetti({
        particleCount: 50,
        spread: 75,
        colors: ['#38bdf8', '#fb7185', '#facc15', '#4ade80', '#ffffff'],
        shapes: ['square'],
      });
    } catch {
      // ignore
    }

    // Return to the Select World page
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
              playerProfile={playerProfile}
              onSaveProfile={handleSaveProfile}
            />
          )}

          {/* World 1: Decoration and Prep (Bonus Chest Game) */}
          {activeSection === 'spawn' && activeWorldId === 'w1' && (
            <BonusChestGame
              worldId="w1"
              worldTitle={WORLD_TITLES.w1}
              onBack={() => setActiveWorldId(null)}
              onUnlockNext={handleUnlockWorld2}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
              playerProfile={playerProfile}
            />
          )}

          {/* World 2: Friday Morning (The TSS Headquarters Quest) */}
          {activeSection === 'spawn' && activeWorldId === 'w2' && (
            <FridayMorningQuest
              worldId="w2"
              worldTitle={WORLD_TITLES.w2}
              onBack={() => setActiveWorldId(null)}
              onUnlockNext={handleUnlockWorld3}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
              playerProfile={playerProfile}
            />
          )}

          {/* World Select Screen */}
          {activeSection === 'spawn' && !activeWorldId && (
            <SpawnPointSection
              onBack={() => handleNavigate('menu')}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
              unlockedWorlds={unlockedWorlds}
              onPlayWorld={(id) => {
                if (unlockedWorlds.includes(id)) {
                  setActiveWorldId(id);
                }
              }}
            />
          )}
        </main>
      )}
    </div>
  );
}
