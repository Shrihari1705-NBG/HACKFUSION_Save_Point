import React, { useState } from 'react';
import { soundManager } from '../../utils/sound';
import { Volume2, VolumeX, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WorldItem {
  id: string;
  title: string;
  date: string;
  image: string;
  description: string;
  highlights: string[];
  locked: boolean;
}

const WORLDS: WorldItem[] = [
  {
    id: 'w1',
    title: 'DECORATION AND PREP',
    date: '(29/10/2026)',
    image: '/assets/Decoration_and_prep.png',
    description:
      'The foundation day. The Software Society crew assembling the arena, testing networks, setting up stage banners, arranging welcome kits, and preparing the save point for incoming hackers.',
    highlights: [
      'Venue Setup & Banners',
      'Network & Power Stress Tests',
      'Badge Sorting & Swag Packs',
      'Midnight Pre-Event Excitement',
    ],
    locked: false,
  },
  {
    id: 'w2',
    title: 'FRIDAY MORNING',
    date: '(30/10/2026)',
    image: '/assets/Friday_morning.png',
    description:
      'Day 1 arrives. Registration queues, enthusiastic team formations, opening keynotes, brainstorming clusters, and git repositories created as the clock starts ticking.',
    highlights: [
      'The Opening Ceremony',
      'Team Ideation & Scoping',
      'First Git Commits',
      'Mentors Initial Walkthrough',
    ],
    locked: true,
  },
  {
    id: 'w3',
    title: 'JAMMING NIGHT',
    date: '(30/10/2026)',
    image: '/assets/Jamming_night.png',
    description:
      'The legendary nocturnal hackathon sprint. Coding under ambient glow, coffee runs, pizza slices, acoustic guitar jams, laughing through bug hunts, and pushing the boundaries.',
    highlights: [
      'Midnight Coffee & Energy Boosts',
      'Acoustic Jam Sessions',
      'The Missing Semicolon Hunt',
      '3:42 AM Break-Throughs',
    ],
    locked: true,
  },
  {
    id: 'w4',
    title: 'END MEMORIES',
    date: '(31/10/2026)',
    image: '/assets/End_memories.png',
    description:
      'The final stretch and victory lap. Final code pushes, adrenaline-fueled project demos, judge evaluations, cheers, applause, and saving permanent HackFusion 2.0 memories forever.',
    highlights: [
      'Final Submission Countdown',
      'Live Stage Demos & Pitches',
      'Judges Feedback & Cheering',
      'Permanent Save Point Captured',
    ],
    locked: true,
  },
];

interface SpawnPointSectionProps {
  onBack: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPlayWorld: (worldId: string) => void;
  unlockedWorlds?: string[];
}

export const SpawnPointSection: React.FC<SpawnPointSectionProps> = ({
  onBack,
  soundEnabled,
  onToggleSound,
  onPlayWorld,
  unlockedWorlds,
}) => {
  const [selectedWorldId, setSelectedWorldId] = useState<string>('w1');
  const [lockedTooltipId, setLockedTooltipId] = useState<string | null>(null);

  const isWorldLocked = (worldId: string) => {
    if (unlockedWorlds && unlockedWorlds.length > 0) {
      return !unlockedWorlds.includes(worldId);
    }
    return worldId !== 'w1';
  };

  const handleSelectWorld = (worldId: string) => {
    if (isWorldLocked(worldId)) {
      soundManager.playButtonClick();
      setLockedTooltipId(worldId);
      setTimeout(() => {
        setLockedTooltipId(null);
      }, 2000);
      return;
    }
    soundManager.playButtonClick();
    setSelectedWorldId(worldId);
  };

  const handlePlaySelectedWorld = () => {
    if (isWorldLocked(selectedWorldId)) return;

    soundManager.playSavePointSound();

    // Fire subtle celebratory voxel confetti
    confetti({
      particleCount: 30,
      spread: 60,
      colors: ['#38bdf8', '#fb7185', '#facc15', '#4ade80', '#ffffff'],
      shapes: ['square'],
      ticks: 160,
    });

    onPlayWorld(selectedWorldId);
  };

  const selectedWorld = WORLDS.find((w) => w.id === selectedWorldId) || WORLDS[0];

  return (
    <div className="mc-select-world-screen" role="region" aria-label="Select World">
      {/* Top Header - Strict Minecraft Select World Layout */}
      <header className="mc-select-world-header">
        <h1 className="mc-select-world-title">SELECT WORLD</h1>
      </header>

      {/* Middle Track - Darkened Minecraft Scrollable World List */}
      <div className="mc-select-world-track">
        <div className="mc-select-world-list" role="listbox" aria-label="World List">
          {WORLDS.map((world) => {
            const isSelected = selectedWorldId === world.id;
            const locked = isWorldLocked(world.id);
            return (
              <div
                key={world.id}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                className={`mc-world-entry ${isSelected ? 'selected' : ''} ${locked ? 'locked' : ''}`}
                style={{ position: 'relative' }}
                onClick={() => handleSelectWorld(world.id)}
                onDoubleClick={() => {
                  if (!locked && world.id === selectedWorldId) {
                    handlePlaySelectedWorld();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectWorld(world.id);
                  }
                }}
              >
                {/* Thumbnail image */}
                <div
                  className="mc-world-thumbnail-container"
                  aria-hidden="true"
                  style={{
                    filter: locked ? 'grayscale(100%) brightness(0.5)' : undefined,
                  }}
                >
                  <img
                    src={world.image}
                    alt=""
                    className="mc-world-thumbnail-img"
                    loading="eager"
                  />
                </div>

                {/* World name and Date underneath */}
                <div className="mc-world-info">
                  <div
                    className="mc-world-name"
                    style={{ color: locked ? '#6b7280' : undefined }}
                  >
                    {locked && (
                      <Lock
                        size={11}
                        style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }}
                        aria-hidden="true"
                      />
                    )}
                    {world.title}
                  </div>
                  <div className="mc-world-date">{world.date}</div>
                  {locked && (
                    <div
                      style={{
                        fontFamily: 'var(--mc-font-pixel)',
                        fontSize: '0.5rem',
                        color: '#6b7280',
                        marginTop: '0.2rem',
                        letterSpacing: '0.04em',
                      }}
                    >
                      🔒 WORLD LOCKED
                    </div>
                  )}
                </div>

                {/* Locked tooltip */}
                {locked && lockedTooltipId === world.id && (
                  <div
                    role="tooltip"
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#1f2937',
                      border: '2px solid #374151',
                      boxShadow: '3px 3px 0 #000',
                      color: '#f9fafb',
                      fontFamily: 'var(--mc-font-pixel)',
                      fontSize: '0.48rem',
                      padding: '0.5rem 0.75rem',
                      whiteSpace: 'nowrap',
                      zIndex: 50,
                      letterSpacing: '0.03em',
                      pointerEvents: 'none',
                    }}
                  >
                    This world hasn't been generated yet!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer - Minecraft Game Control Bar */}
      <footer className="mc-select-world-footer">
        <div className="mc-select-world-buttons">
          <button
            type="button"
            className="mc-game-btn mc-play-world-btn"
            onClick={handlePlaySelectedWorld}
            disabled={selectedWorld.locked}
            aria-label={`Play selected world: ${selectedWorld.title}`}
            style={{ opacity: selectedWorld.locked ? 0.5 : 1, cursor: selectedWorld.locked ? 'not-allowed' : undefined }}
          >
            PLAY SELECTED WORLD
          </button>

          <button
            type="button"
            className="mc-game-btn mc-cancel-btn"
            onClick={() => {
              soundManager.playButtonClick();
              onBack();
            }}
            aria-label="Cancel and return to title screen"
          >
            CANCEL
          </button>

          <button
            type="button"
            className="mc-stone-btn"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            style={{ minWidth: 'auto', padding: '0.65rem 0.9rem' }}
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
        </div>
      </footer>
    </div>
  );
};
