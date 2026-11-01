import React, { useState } from 'react';
import { soundManager } from '../../utils/sound';
import { ArrowLeft, Volume2, VolumeX, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WorldItem {
  id: string;
  title: string;
  date: string;
  description: string;
  highlights: string[];
}

const WORLDS: WorldItem[] = [
  {
    id: 'w1',
    title: 'DECORATION AND PREP',
    date: '(29/10/2026)',
    description: 'The foundation day. The Software Society crew assembling the arena, testing networks, setting up stage banners, arranging welcome kits, and preparing the save point for incoming hackers.',
    highlights: ['Venue Setup & Banners', 'Network & Power Stress Tests', 'Badge Sorting & Swag Packs', 'Midnight Pre-Event Excitement'],
  },
  {
    id: 'w2',
    title: 'FRIDAY MORNING',
    date: '(30/10/2026)',
    description: 'Day 1 arrives. Registration queues, enthusiastic team formations, opening keynotes, brainstorming clusters, and git repositories created as the clock starts ticking.',
    highlights: ['The Opening Ceremony', 'Team Ideation & Scoping', 'First Git Commits', 'Mentors Initial Walkthrough'],
  },
  {
    id: 'w3',
    title: 'JAMMING NIGHT',
    date: '(30/10/2026)',
    description: 'The legendary nocturnal hackathon sprint. Coding under ambient glow, coffee runs, pizza slices, acoustic guitar jams, laughing through bug hunts, and pushing the boundaries.',
    highlights: ['Midnight Coffee & Energy Boosts', 'Acoustic Jam Sessions', 'The Missing Semicolon Hunt', '3:42 AM Break-Throughs'],
  },
  {
    id: 'w4',
    title: 'END MEMORIES',
    date: '(31/10/2026)',
    description: 'The final stretch and victory lap. Final code pushes, adrenaline-fueled project demos, judge evaluations, cheers, applause, and saving permanent HackFusion 2.0 memories forever.',
    highlights: ['Final Submission Countdown', 'Live Stage Demos & Pitches', 'Judges Feedback & Cheering', 'Permanent Save Point Captured'],
  },
];

interface SpawnPointSectionProps {
  onBack: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const SpawnPointSection: React.FC<SpawnPointSectionProps> = ({
  onBack,
  soundEnabled,
  onToggleSound,
}) => {
  const [selectedWorldId, setSelectedWorldId] = useState<string>('w1');
  const [activeWorldView, setActiveWorldView] = useState<WorldItem | null>(null);

  const handleSelectWorld = (id: string) => {
    soundManager.playButtonClick();
    setSelectedWorldId(id);
  };

  const handlePlaySelectedWorld = () => {
    soundManager.playSavePointSound();
    const world = WORLDS.find((w) => w.id === selectedWorldId) || WORLDS[0];
    setActiveWorldView(world);

    // Fire subtle celebratory voxel confetti
    confetti({
      particleCount: 30,
      spread: 60,
      colors: ['#38bdf8', '#fb7185', '#facc15', '#4ade80', '#ffffff'],
      shapes: ['square'],
      ticks: 160,
    });
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
            return (
              <div
                key={world.id}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                className={`mc-world-entry ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectWorld(world.id)}
                onDoubleClick={handlePlaySelectedWorld}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectWorld(world.id);
                  }
                }}
              >
                {/* Blue square placeholder icon from reference pic */}
                <div className="mc-world-icon-blue" aria-hidden="true" />

                {/* World name and Date underneath */}
                <div className="mc-world-info">
                  <div className="mc-world-name">{world.title}</div>
                  <div className="mc-world-date">{world.date}</div>
                </div>
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
            aria-label={`Play selected world: ${selectedWorld.title}`}
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

      {/* World Memory Detail Modal when "Play Selected World" is triggered */}
      {activeWorldView && (
        <div
          className="mc-modal-backdrop"
          onClick={() => setActiveWorldView(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="mc-modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px' }}
          >
            <div className="mc-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="mc-world-icon-blue" style={{ width: '32px', height: '32px', minWidth: '32px' }} />
                <div>
                  <h2 className="mc-section-title" style={{ fontSize: '0.85rem' }}>
                    {activeWorldView.title}
                  </h2>
                  <span style={{ fontFamily: 'var(--mc-font-pixel)', fontSize: '0.6rem', color: '#a8a8a8' }}>
                    {activeWorldView.date}
                  </span>
                </div>
              </div>
              <Sparkles size={16} color="#facc15" />
            </div>

            <p style={{ fontFamily: 'var(--mc-font-body)', fontSize: '0.98rem', color: '#ffffff', lineHeight: '1.5', margin: '0.5rem 0' }}>
              {activeWorldView.description}
            </p>

            <div style={{ borderTop: '2px solid #1c1c1c', paddingTop: '0.75rem' }}>
              <div style={{ fontFamily: 'var(--mc-font-pixel)', fontSize: '0.62rem', color: '#38bdf8', marginBottom: '0.5rem' }}>
                MEMORIES & CHECKPOINTS:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {activeWorldView.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontFamily: 'var(--mc-font-sub)',
                      fontSize: '0.88rem',
                      color: '#e2e8f0',
                      padding: '0.35rem 0.6rem',
                      backgroundColor: '#1c1c1c',
                      border: '1px solid #333',
                    }}
                  >
                    <span style={{ color: '#4ade80' }}>✔</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                className="mc-game-btn"
                style={{ flex: 1 }}
                onClick={() => {
                  soundManager.playButtonClick();
                  setActiveWorldView(null);
                }}
              >
                <ArrowLeft size={13} style={{ marginRight: '0.4rem' }} />
                <span>BACK TO WORLDS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
