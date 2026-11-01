import React, { useState, useEffect, useCallback, useRef } from 'react';
import { soundManager } from '../../utils/sound';
import { assetPreloader } from '../../utils/assetPreloader';
import './bonusChest.css';

// ── Types ──────────────────────────────────────────────────────────────────

type GamePhase =
  | { kind: 'chest_selection' }
  | { kind: 'exploding'; chestIndex: number }
  | { kind: 'death_screen'; chestIndex: number }
  | { kind: 'chest_opening'; chestIndex: number }
  | { kind: 'achievement' }
  | { kind: 'memory_collection' };

export interface BonusChestGameProps {
  worldId?: string;
  worldTitle?: string;
  onBack: () => void;
  onUnlockNext?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  label: string;
  filename: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const WINNING_CHEST_INDEX = 1; // Center chest (0, 1, 2)

// Confirmed media assets in Decoration & Prep
const DECORATION_MEDIA: MediaItem[] = [
  {
    id: 'm1',
    type: 'image',
    src: '/assets/memories/IMG_6220.jpg',
    label: 'Memory #1',
    filename: 'IMG_6220.jpg',
  },
  {
    id: 'm2',
    type: 'image',
    src: '/assets/memories/IMG_6236.jpg',
    label: 'Memory #2',
    filename: 'IMG_6236.jpg',
  },
  {
    id: 'm3',
    type: 'video',
    src: '/assets/memories/IMG_6193.MOV',
    label: 'Prep Video #1',
    filename: 'IMG_6193.MOV',
  },
  {
    id: 'm4',
    type: 'video',
    src: '/assets/memories/IMG_6199.MOV',
    label: 'Prep Video #2',
    filename: 'IMG_6199.MOV',
  },
  {
    id: 'm5',
    type: 'video',
    src: '/assets/memories/IMG_6219.MOV',
    label: 'Prep Video #3',
    filename: 'IMG_6219.MOV',
  },
];

// Particle colours for explosion
const EXPLOSION_COLORS = ['#ff6a00', '#ff3300', '#facc15', '#ff8c00', '#ff4500'];
// Gold particle colours for correct chest
const GOLD_COLORS = ['#facc15', '#fde047', '#fbbf24', '#f59e0b', '#fef08a'];

// ── Helpers ────────────────────────────────────────────────────────────────

function randomBetween(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

interface Particle {
  id: number;
  color: string;
  size: number;
  tx: number;
  ty: number;
  left: number;
  top: number;
}

function makeExplosionParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: EXPLOSION_COLORS[Math.floor(Math.random() * EXPLOSION_COLORS.length)],
    size: randomBetween(6, 10),
    tx: randomBetween(-120, 120),
    ty: randomBetween(-140, -20),
    left: randomBetween(20, 80),
    top: randomBetween(10, 70),
  }));
}

function makeGoldParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
    size: randomBetween(6, 12),
    tx: randomBetween(-90, 90),
    ty: randomBetween(-140, -30),
    left: randomBetween(20, 80),
    top: randomBetween(15, 65),
  }));
}

// ── Floating Clouds Component ──────────────────────────────────────────────
// Repeats multiple voxel clouds across the sky at varying sizes with smooth fade

const FloatingSkyClouds: React.FC = () => (
  <div className="bc-clouds-layer" aria-hidden="true">
    <img
      src="/assets/voxel-clouds.png"
      alt=""
      className="bc-cloud bc-cloud-1"
      draggable={false}
    />
    <img
      src="/assets/voxel-clouds.png"
      alt=""
      className="bc-cloud bc-cloud-2"
      draggable={false}
    />
    <img
      src="/assets/voxel-clouds.png"
      alt=""
      className="bc-cloud bc-cloud-3"
      draggable={false}
    />
  </div>
);

// ── Lightbox Sub-component with Download Button beside X mark ──────────────

interface LightboxProps {
  media: MediaItem[];
  startIndex: number;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ media, startIndex, onClose }) => {
  const [index, setIndex] = useState(startIndex);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);

  const goNext = useCallback(() => {
    setIsBuffering(false);
    setHasError(false);
    setIndex((i) => Math.min(i + 1, media.length - 1));
  }, [media.length]);

  const goPrev = useCallback(() => {
    setIsBuffering(false);
    setHasError(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, onClose]);

  const current = media[index];

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playButtonClick();
    const link = document.createElement('a');
    link.href = current.src;
    link.download = current.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="bc-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
      onClick={onClose}
    >
      <div className="bc-lightbox-content" onClick={(e) => e.stopPropagation()}>
        {current.type === 'image' ? (
          <img
            src={current.src}
            alt={current.label}
            className="bc-lightbox-media bc-lightbox-img"
            draggable={false}
          />
        ) : hasError ? (
          <div className="bc-lightbox-error-fallback">
            <div className="bc-lightbox-error-title">⚠️ VIDEO PLAYBACK NOTICE</div>
            <div className="bc-lightbox-error-desc">
              Browser media decoder cannot directly preview this .MOV video format inline.
              The original full-resolution file is ready to download!
            </div>
            <button
              type="button"
              className="bc-lightbox-download-btn"
              onClick={handleDownload}
            >
              ⬇ DOWNLOAD {current.filename}
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <video
              key={current.src}
              src={current.src}
              controls
              autoPlay
              playsInline
              className="bc-lightbox-media bc-lightbox-video"
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
              onCanPlay={() => setIsBuffering(false)}
              onError={() => {
                setIsBuffering(false);
                setHasError(true);
              }}
            />
            {isBuffering && (
              <div className="bc-lightbox-buffering" aria-live="polite">
                <div className="bc-buffering-spinner" aria-hidden="true" />
                <span>BUFFERING VIDEO...</span>
              </div>
            )}
          </div>
        )}

        {/* Top actions: Download button beside X mark */}
        <div className="bc-lightbox-top-actions">
          <button
            type="button"
            className="bc-lightbox-download-btn"
            onClick={handleDownload}
            aria-label={`Download ${current.filename}`}
            title={`Download ${current.filename}`}
          >
            <span style={{ fontSize: '0.85rem' }}>⬇</span>
            <span>DOWNLOAD</span>
          </button>
          <button
            type="button"
            className="bc-lightbox-close"
            onClick={onClose}
            aria-label="Close viewer"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Previous / Next buttons */}
        <button
          type="button"
          className="bc-lightbox-prev"
          onClick={() => {
            soundManager.playBlipSound();
            goPrev();
          }}
          disabled={index === 0}
          aria-label="Previous item"
        >
          ‹
        </button>

        <button
          type="button"
          className="bc-lightbox-next"
          onClick={() => {
            soundManager.playBlipSound();
            goNext();
          }}
          disabled={index === media.length - 1}
          aria-label="Next item"
        >
          ›
        </button>

        {/* Footer info */}
        <div className="bc-lightbox-footer">
          <span className="bc-lightbox-filename">{current.label} ({current.filename})</span>
          <span className="bc-lightbox-counter">
            {index + 1} / {media.length}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────

export const BonusChestGame: React.FC<BonusChestGameProps> = ({
  onBack,
  onUnlockNext,
}) => {
  const [phase, setPhase] = useState<GamePhase>({ kind: 'chest_selection' });
  const [animating, setAnimating] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Track all pending timers so we can clear them on unmount
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  // ── Chest click handler ──────────────────────────────────────────────────

  const handleChestClick = useCallback(
    (chestIndex: number) => {
      if (animating) return;
      setAnimating(true);
      soundManager.playButtonClick();

      if (chestIndex === WINNING_CHEST_INDEX) {
        // Correct chest! Quick celebration burst, then immediate achievement
        soundManager.playSavePointSound();
        setParticles(makeGoldParticles(20));
        setPhase({ kind: 'chest_opening', chestIndex });

        addTimer(() => {
          setParticles([]);
          setPhase({ kind: 'achievement' });
          soundManager.playWorldReadySound();
          setAnimating(false);
        }, 650);
      } else {
        // Wrong chest — explosion
        soundManager.playWorldGenTick();
        setShowFlash(true);
        setParticles(makeExplosionParticles(14));
        setPhase({ kind: 'exploding', chestIndex });

        addTimer(() => {
          setShowFlash(false);
        }, 500);

        addTimer(() => {
          setParticles([]);
          setPhase({ kind: 'death_screen', chestIndex });
          setAnimating(false);
        }, 1100);
      }
    },
    [animating, addTimer]
  );

  // ── Respawn (reset to chest selection) ──────────────────────────────────

  const handleRespawn = useCallback(() => {
    soundManager.playButtonClick();
    setPhase({ kind: 'chest_selection' });
    setAnimating(false);
    setParticles([]);
    setShowFlash(false);
  }, []);

  // ── Achievement dismiss: Stays until user clicks anywhere ────────────────

  const handleAchievementDismiss = useCallback(() => {
    soundManager.playButtonClick();
    setPhase({ kind: 'memory_collection' });
  }, []);

  // ── Render helpers ──────────────────────────────────────────────────────

  const isExploding = phase.kind === 'exploding';
  const isOpening = phase.kind === 'chest_opening';

  const renderChestRow = () => (
    <div className="bc-chest-row">
      {[0, 1, 2].map((i) => {
        const chestClass = [
          'bc-chest-wrapper',
          isExploding && (phase as { chestIndex: number }).chestIndex === i ? 'shaking' : '',
          isOpening && (phase as { chestIndex: number }).chestIndex === i ? 'opening' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={i}
            type="button"
            className={chestClass}
            onClick={() => handleChestClick(i)}
            disabled={animating}
            aria-label={`Chest ${i + 1}`}
            onMouseEnter={() => {
              if (!animating) soundManager.playBlipSound();
            }}
          >
            {/* Particles rendered relative to center chest */}
            {particles.length > 0 &&
              ((isExploding && (phase as { chestIndex: number }).chestIndex === i) ||
                (isOpening && (phase as { chestIndex: number }).chestIndex === i)) &&
              particles.map((p) => (
                <div
                  key={p.id}
                  className={isExploding ? 'bc-particle' : 'bc-gold-particle'}
                  style={{
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    '--tx': `${p.tx}px`,
                    '--ty': `${p.ty}px`,
                  } as React.CSSProperties}
                />
              ))}

            <img
              src="/assets/Bonus_chest.png"
              alt=""
              className="bc-chest-img"
              draggable={false}
            />
            <div className="bc-chest-shadow" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );

  // ── Chest Selection Phase (Picture 1 & 2 Layout) ─────────────────────────

  if (
    phase.kind === 'chest_selection' ||
    phase.kind === 'exploding' ||
    phase.kind === 'chest_opening'
  ) {
    return (
      <div className="bc-screen bc-sky" role="main">
        <button
          type="button"
          className="bc-back-btn"
          onClick={() => {
            soundManager.playButtonClick();
            onBack();
          }}
          aria-label="Back to Select World"
        >
          ← BACK
        </button>

        {/* Floating clouds varying in size without sharp cutoff */}
        <FloatingSkyClouds />

        {showFlash && <div className="bc-flash-overlay" aria-hidden="true" />}

        <div className="bc-chest-selection-content">
          <div className="bc-heading">
            WELCOME TO WORLD
          </div>
          <div className="bc-subheading">
            CHOOSE BONUS CHEST
          </div>

          {renderChestRow()}
        </div>
      </div>
    );
  }

  // ── Death Screen Phase ──────────────────────────────────────────────────

  if (phase.kind === 'death_screen') {
    return (
      <div className="bc-screen bc-death-screen" role="main">
        <div className="bc-death-title">💥 BOOM! YOU'VE BEEN BLOWN UP!</div>
        <div className="bc-death-subtitle">
          You opened the wrong chest. Your memories are still out there.
        </div>
        <div className="bc-death-tip">Tip: Fortune favors the curious.</div>
        <div className="bc-death-buttons">
          <button type="button" className="bc-btn-respawn" onClick={handleRespawn}>
            ↺ RESPAWN
          </button>
          <button type="button" className="bc-btn-back-chests" onClick={handleRespawn}>
            ← BACK TO CHESTS
          </button>
        </div>
      </div>
    );
  }

  // ── Achievement Phase (Stays until user clicks anywhere) ─────────────────

  if (phase.kind === 'achievement') {
    return (
      <div
        className="bc-screen bc-sky"
        role="main"
        onClick={handleAchievementDismiss}
        style={{ cursor: 'pointer' }}
      >
        <FloatingSkyClouds />

        <div className="bc-achievement-overlay">
          <div
            className="bc-achievement-panel"
            role="status"
            aria-live="polite"
          >
            <div className="bc-achievement-label">🏆 ACHIEVEMENT UNLOCKED!</div>
            <div className="bc-achievement-title">MEMORY KEEPER</div>
            <div className="bc-achievement-quote">
              "Some treasures aren't diamonds. They're the people and moments that made this
              adventure unforgettable."
            </div>
            <div className="bc-achievement-skip">Click anywhere to continue…</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Memory Collection Phase (Exact Picture 5 with Village in Front) ──────

  if (phase.kind === 'memory_collection') {
    return (
      <div className="bc-screen bc-sky bc-phase-screen" role="main">
        {/* Top-level container: Blue box on left, present media cards on right */}
        <div className="bc-phase-container">
          <div className="bc-phase-left">
            <div className="bc-phase-card">
              PHASE 1 MEMORIES ARE COLLECTED
            </div>
            <button
              type="button"
              className="bc-phase-back-btn"
              onClick={() => {
                soundManager.playButtonClick();
                if (onUnlockNext) {
                  onUnlockNext();
                } else {
                  onBack();
                }
              }}
              aria-label="Continue Unlocking Memories"
              title="Unlock next level and return to title screen"
            >
              CONTINUE UNLOCKING MEMORIES ➔
            </button>
          </div>

          {/* Cards for ONLY present media items (no empty cards!) */}
          <div className="bc-phase-grid" role="list" aria-label="Collected Memories">
            {DECORATION_MEDIA.map((item, idx) => (
              <div
                key={item.id}
                className="bc-phase-slot has-photo"
                role="listitem"
                tabIndex={0}
                onClick={() => {
                  soundManager.playButtonClick();
                  setLightboxIndex(idx);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    soundManager.playButtonClick();
                    setLightboxIndex(idx);
                  }
                }}
                aria-label={`Open ${item.label}`}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.src}
                    alt={item.label}
                    className="bc-phase-slot-img"
                    draggable={false}
                    decoding="async"
                  />
                ) : (
                  <div className="bc-video-thumb-container">
                    {assetPreloader.getVideoPoster(item.src) ? (
                      <img
                        src={assetPreloader.getVideoPoster(item.src)}
                        alt={item.label}
                        className="bc-phase-slot-img"
                        draggable={false}
                      />
                    ) : (
                      <video
                        src={item.src}
                        className="bc-phase-slot-img"
                        preload="metadata"
                        muted
                        playsInline
                      />
                    )}
                    <div className="bc-video-play-badge">
                      <span className="bc-play-icon">▶</span>
                      <span>VIDEO</span>
                    </div>
                  </div>
                )}
                <div className="bc-phase-slot-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Minecraft Village landscape brought to front and uncropped */}
        <div className="bc-phase-village" aria-hidden="true">
          <img
            src="/assets/village-cutout.png"
            alt=""
            className="bc-phase-village-img"
            draggable={false}
          />
        </div>

        {/* Lightbox with Download button beside X mark */}
        {lightboxIndex !== null && (
          <Lightbox
            media={DECORATION_MEDIA}
            startIndex={lightboxIndex}
            onClose={() => {
              soundManager.playButtonClick();
              setLightboxIndex(null);
            }}
          />
        )}
      </div>
    );
  }

  return null;
};
