import React, { useState, useEffect, useCallback } from 'react';
import { soundManager } from '../../utils/sound';
import { DIRT_TEXTURE_URI } from '../../utils/textures';
import confetti from 'canvas-confetti';
import './fridayMorning.css';

export interface FridayMorningQuestProps {
  worldId?: string;
  worldTitle?: string;
  onBack: () => void;
  onUnlockNext: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  playerProfile?: {
    name: string;
    gender: string;
  };
}

interface PhotoItem {
  id: string;
  type?: 'image' | 'video';
  src: string;
  label: string;
  filename: string;
}

// All confirmed Friday Morning photographs and videos
const FRIDAY_MORNING_PHOTOS: PhotoItem[] = [
  {
    id: 'fm-video-devotional',
    type: 'video',
    src: '/assets/memories/friday_morning/WhatsApp Video 2026-11-01 at 8.47.28 PM.mp4',
    label: 'Devotional Test',
    filename: 'Devotional_Test.mp4',
  },
  { id: 'fm1',  src: '/assets/memories/friday_morning/IMG_6234.JPG', label: 'Morning Arrival',       filename: 'IMG_6234.JPG' },
  { id: 'fm2',  src: '/assets/memories/friday_morning/IMG_6246.JPG', label: 'Early Setup',           filename: 'IMG_6246.JPG' },
  { id: 'fm3',  src: '/assets/memories/friday_morning/IMG_6254.JPG', label: 'Team Gathering',        filename: 'IMG_6254.JPG' },
  { id: 'fm4',  src: '/assets/memories/friday_morning/IMG_6346.JPG', label: 'HQ Arrives',            filename: 'IMG_6346.JPG' },
  { id: 'fm5',  src: '/assets/memories/friday_morning/IMG_6347.JPG', label: 'Ready to Roll',         filename: 'IMG_6347.JPG' },
  { id: 'fm6',  src: '/assets/memories/friday_morning/IMG_6351.JPG', label: 'Planning Session',      filename: 'IMG_6351.JPG' },
  { id: 'fm7',  src: '/assets/memories/friday_morning/IMG_6352.JPG', label: 'Ideation Begins',       filename: 'IMG_6352.JPG' },
  { id: 'fm8',  src: '/assets/memories/friday_morning/IMG_6354.JPG', label: 'Collaboration',         filename: 'IMG_6354.JPG' },
  { id: 'fm9',  src: '/assets/memories/friday_morning/IMG_6359.JPG', label: 'Deep Focus',            filename: 'IMG_6359.JPG' },
  { id: 'fm10', src: '/assets/memories/friday_morning/IMG_6360.JPG', label: 'Team Spirit',           filename: 'IMG_6360.JPG' },
  { id: 'fm11', src: '/assets/memories/friday_morning/IMG_6361.JPG', label: 'Coding Begins',         filename: 'IMG_6361.JPG' },
  { id: 'fm12', src: '/assets/memories/friday_morning/IMG_6365.JPG', label: 'Momentum Building',     filename: 'IMG_6365.JPG' },
  { id: 'fm13', src: '/assets/memories/friday_morning/IMG_6370.JPG', label: 'Side Quest',            filename: 'IMG_6370.JPG' },
  { id: 'fm14', src: '/assets/memories/friday_morning/IMG_6372.JPG', label: 'Coffee Break',          filename: 'IMG_6372.JPG' },
  { id: 'fm15', src: '/assets/memories/friday_morning/IMG_6374.JPG', label: 'Back to Business',      filename: 'IMG_6374.JPG' },
  { id: 'fm16', src: '/assets/memories/friday_morning/IMG_6375.JPG', label: 'Sprint Mode',           filename: 'IMG_6375.JPG' },
  { id: 'fm17', src: '/assets/memories/friday_morning/IMG_6377.JPG', label: 'Focused Builders',      filename: 'IMG_6377.JPG' },
  { id: 'fm18', src: '/assets/memories/friday_morning/IMG_6384.JPG', label: 'Whiteboard Wars',       filename: 'IMG_6384.JPG' },
  { id: 'fm19', src: '/assets/memories/friday_morning/IMG_6386.JPG', label: 'Mentor Visit',          filename: 'IMG_6386.JPG' },
  { id: 'fm20', src: '/assets/memories/friday_morning/IMG_6390.JPG', label: 'Group Think',           filename: 'IMG_6390.JPG' },
  { id: 'fm21', src: '/assets/memories/friday_morning/IMG_6391.JPG', label: 'Pair Programming',      filename: 'IMG_6391.JPG' },
  { id: 'fm22', src: '/assets/memories/friday_morning/IMG_6393.JPG', label: 'Demo Prep',             filename: 'IMG_6393.JPG' },
  { id: 'fm23', src: '/assets/memories/friday_morning/IMG_6395.JPG', label: 'Final Stretch',         filename: 'IMG_6395.JPG' },
  { id: 'fm24', src: '/assets/memories/friday_morning/IMG_6400.JPG', label: 'Submission Crunch',     filename: 'IMG_6400.JPG' },
  { id: 'fm25', src: '/assets/memories/friday_morning/IMG_6401.JPG', label: 'Last Minute Push',      filename: 'IMG_6401.JPG' },
  { id: 'fm26', src: '/assets/memories/friday_morning/IMG_6405.JPG', label: 'It Is Done!',           filename: 'IMG_6405.JPG' },
  { id: 'fm27', src: '/assets/memories/friday_morning/IMG_6411.JPG', label: 'Relief & Joy',          filename: 'IMG_6411.JPG' },
  { id: 'fm28', src: '/assets/memories/friday_morning/IMG_6412.JPG', label: 'Victory Lap',           filename: 'IMG_6412.JPG' },
  { id: 'fm29', src: '/assets/memories/friday_morning/IMG_6414.JPG', label: 'Post-Submit Smiles',    filename: 'IMG_6414.JPG' },
  { id: 'fm30', src: '/assets/memories/friday_morning/IMG_6419.JPG', label: 'TSS Represent',         filename: 'IMG_6419.JPG' },
  { id: 'fm31', src: '/assets/memories/friday_morning/IMG_6423.JPG', label: 'Closing Moments',       filename: 'IMG_6423.JPG' },
  { id: 'fm32', src: '/assets/memories/friday_morning/IMG_6428.JPG', label: 'The Crew',              filename: 'IMG_6428.JPG' },
  { id: 'fm33', src: '/assets/memories/friday_morning/IMG_6431.JPG', label: 'Until Next Time',       filename: 'IMG_6431.JPG' },
  { id: 'fm34', src: '/assets/memories/friday_morning/IMG_6432.JPG', label: 'Goodbye HQ',            filename: 'IMG_6432.JPG' },
];

type QuestStage =
  | 'arrival'
  | 'castle_admiration'
  | 'mob_spawn'
  | 'checkpoint_q1'
  | 'checkpoint_q2'
  | 'checkpoint_q3'
  | 'defeat'
  | 'checkpoint_passed'
  | 'walking_into_castle'
  | 'achievement'
  | 'gallery';

interface DialogueLine {
  speaker: 'player' | 'zombie' | 'creeper' | 'skeleton';
  name: string;
  text: string;
}

const CASTLE_DIALOGUE: DialogueLine[] = [
  {
    speaker: 'player',
    name: 'Player',
    text: 'Whoa... look at that castle!',
  },
  {
    speaker: 'player',
    name: 'Player',
    text: 'Imagine turning this place into the TSS Headquarters!',
  },
  {
    speaker: 'player',
    name: 'Player',
    text: 'Weekly DSA battles, coding sessions, workshops... all of it happening right here.',
  },
  {
    speaker: 'player',
    name: 'Player',
    text: 'Okay, this place is officially on my wishlist.',
  },
];

const AMBUSH_OPENING_DIALOGUE: DialogueLine[] = [
  {
    speaker: 'zombie',
    name: 'Zombie',
    text: 'HALT! Nobody enters this castle without answering our question.',
  },
  {
    speaker: 'player',
    name: 'Player',
    text: 'Wait... you guys own this place?',
  },
  {
    speaker: 'creeper',
    name: 'Creeper',
    text: 'SSSSSS... That is not the question.',
  },
  {
    speaker: 'skeleton',
    name: 'Skeleton',
    text: 'Are you following The Software Society?',
  },
];

const PASSED_DIALOGUE: DialogueLine[] = [
  {
    speaker: 'zombie',
    name: 'Zombie',
    text: 'Three confirmations. Interesting.',
  },
  {
    speaker: 'skeleton',
    name: 'Skeleton',
    text: 'All right. You may pass.',
  },
  {
    speaker: 'creeper',
    name: 'Creeper',
    text: 'But listen carefully...',
  },
  {
    speaker: 'zombie',
    name: 'Zombie',
    text: "If you're lying about following TSS, we'll find you.",
  },
  {
    speaker: 'skeleton',
    name: 'Skeleton',
    text: "And we'll be waiting the next time you enter this world.",
  },
  {
    speaker: 'player',
    name: 'Player',
    text: 'Okay, okay! Message received. Can I enter the castle now?',
  },
  {
    speaker: 'creeper',
    name: 'Creeper',
    text: 'SSSSSS... Proceed.',
  },
];

export const FridayMorningQuest: React.FC<FridayMorningQuestProps> = ({
  onBack: _onBack,
  onUnlockNext,
  playerProfile,
}) => {
  const [stage, setStage] = useState<QuestStage>('arrival');
  const [playerX, setPlayerX] = useState<number>(-8); // Percentage from left
  const [isWalking, setIsWalking] = useState<boolean>(true);
  const [frameIndex, setFrameIndex] = useState<number>(0);
  const [castleDialogueIdx, setCastleDialogueIdx] = useState<number>(0);
  const [ambushDialogueIdx, setAmbushDialogueIdx] = useState<number>(0);
  const [passedDialogueIdx, setPassedDialogueIdx] = useState<number>(0);
  const [isScreenShaking, setIsScreenShaking] = useState<boolean>(false);
  const [showDefeatFlash, setShowDefeatFlash] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const playerName = playerProfile?.name?.trim() || 'Adventurer';
  const isFemale = playerProfile?.gender === 'FEMALE';
  const spritePrefix = isFemale ? '/assets/player/Female/F' : '/assets/player/Male/M';

  // Walk cycle animation timer (cycles frames 1 to 8 while walking)
  useEffect(() => {
    if (!isWalking) {
      setFrameIndex(0); // Standing idle frame (Frame 1)
      return;
    }

    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % 8);
    }, 110);

    return () => clearInterval(timer);
  }, [isWalking]);

  // Scene 1: Arrival walk animation (walks from -8% to 22% over 3.2s)
  useEffect(() => {
    if (stage !== 'arrival') return;

    setIsWalking(true);
    const startX = -8;
    const targetX = 22;
    const duration = 3200;
    const startTime = performance.now();

    let animationFrameId: number;
    const walkStep = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Linear smooth walk progression
      const currentX = startX + (targetX - startX) * progress;
      setPlayerX(currentX);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(walkStep);
      } else {
        setIsWalking(false);
        setStage('castle_admiration');
      }
    };

    animationFrameId = requestAnimationFrame(walkStep);
    return () => cancelAnimationFrame(animationFrameId);
  }, [stage]);

  // Scene 3: Transition to Mob Ambush (darkening sky, screen rumble, mob spawn sound)
  const triggerMobSpawn = useCallback(() => {
    setStage('mob_spawn');
    setIsScreenShaking(true);
    soundManager.playMobSpawnSound();

    setTimeout(() => {
      setIsScreenShaking(false);
    }, 600);

    setTimeout(() => {
      setStage('checkpoint_q1');
      setAmbushDialogueIdx(0);
    }, 900);
  }, []);

  // Scene 5: Walking into the castle (from 22% to 76%)
  useEffect(() => {
    if (stage !== 'walking_into_castle') return;

    setIsWalking(true);
    const startX = 22;
    const targetX = 76;
    const duration = 3400;
    const startTime = performance.now();

    let animationFrameId: number;
    const walkStep = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const currentX = startX + (targetX - startX) * progress;
      setPlayerX(currentX);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(walkStep);
      } else {
        setIsWalking(false);
        // Reached castle door! Show achievement
        setStage('achievement');
        soundManager.playWorldReadySound();
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            colors: ['#38bdf8', '#fb7185', '#facc15', '#4ade80', '#ffffff'],
            shapes: ['square'],
          });
        } catch {
          // ignore
        }
      }
    };

    animationFrameId = requestAnimationFrame(walkStep);
    return () => cancelAnimationFrame(animationFrameId);
  }, [stage]);

  // Handle Defeat trigger
  const triggerDefeat = () => {
    soundManager.playCreeperHiss();
    setShowDefeatFlash(true);
    setTimeout(() => {
      setShowDefeatFlash(false);
      setStage('defeat');
    }, 450);
  };

  // Keyboard navigation for dialogues (Space / Enter to advance)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        if (stage === 'castle_admiration') {
          e.preventDefault();
          handleAdvanceCastleDialogue();
        } else if (stage === 'checkpoint_q1' && ambushDialogueIdx < AMBUSH_OPENING_DIALOGUE.length - 1) {
          e.preventDefault();
          setAmbushDialogueIdx((prev) => prev + 1);
        } else if (stage === 'checkpoint_passed') {
          e.preventDefault();
          handleAdvancePassedDialogue();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleAdvanceCastleDialogue = () => {
    soundManager.playButtonClick();
    if (castleDialogueIdx < CASTLE_DIALOGUE.length - 1) {
      setCastleDialogueIdx((prev) => prev + 1);
    } else {
      triggerMobSpawn();
    }
  };

  const handleAdvancePassedDialogue = () => {
    soundManager.playButtonClick();
    if (passedDialogueIdx < PASSED_DIALOGUE.length - 1) {
      setPassedDialogueIdx((prev) => prev + 1);
    } else {
      setStage('walking_into_castle');
    }
  };

  // ── Render Helpers ────────────────────────────────────────────────────────

  const isNight =
    stage === 'mob_spawn' ||
    stage === 'checkpoint_q1' ||
    stage === 'checkpoint_q2' ||
    stage === 'checkpoint_q3' ||
    stage === 'defeat';

  const showMobs =
    stage === 'mob_spawn' ||
    stage === 'checkpoint_q1' ||
    stage === 'checkpoint_q2' ||
    stage === 'checkpoint_q3' ||
    stage === 'defeat' ||
    stage === 'checkpoint_passed' ||
    stage === 'walking_into_castle';

  const currentSpriteSrc = `${spritePrefix}${frameIndex + 1}.png`;

  // ── Scene: Reward Gallery View ───────────────────────────────────────────
  if (stage === 'gallery') {
    return (
      <div className="fm-gallery-screen" role="region" aria-label="Friday Morning Memory Collection">
        <header className="fm-top-hud" style={{ justifyContent: 'flex-end' }}>
          <div className="fm-hud-badge">WORLD 2 • FRIDAY MORNING</div>
        </header>

        {/* Flipped Castle sticking to the ground on the left side (hidden on mobile) */}
        <div className="fm-gallery-castle" aria-hidden="true">
          <img
            src="/assets/player/Castle.png"
            alt=""
            className="fm-gallery-castle-img"
            draggable={false}
          />
        </div>

        {/* Scrollable content area */}
        <div className="fm-gallery-scroll">
          <div className="fm-gallery-container">
            <div className="fm-gallery-left">
              <div className="fm-gallery-card">
                <span>PHASE 2 MEMORIES</span>
                <span style={{ fontSize: '0.62rem', color: '#facc15', marginTop: '0.5rem' }}>
                  ARE COLLECTED!
                </span>
              </div>
              <button
                type="button"
                className="fm-gallery-unlock-btn"
                onClick={() => {
                  soundManager.playSavePointSound();
                  try {
                    confetti({
                      particleCount: 50,
                      spread: 80,
                      colors: ['#38bdf8', '#fb7185', '#facc15', '#4ade80', '#ffffff'],
                      shapes: ['square'],
                    });
                  } catch {
                    // ignore
                  }
                  onUnlockNext();
                }}
                title="Return to Select World"
              >
                CONTINUE UNLOCKING MEMORIES ➔
              </button>
            </div>

            <div className="fm-gallery-grid" role="list" aria-label="Friday Morning Photos">
              {FRIDAY_MORNING_PHOTOS.map((item, idx) => (
                <div
                  key={item.id}
                  className="fm-photo-slot"
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
                  aria-label={`View ${item.label}`}
                >
                  {item.type === 'video' ? (
                    <div className="fm-video-thumb-container">
                      <video
                        src={item.src}
                        className="fm-photo-img"
                        preload="metadata"
                        muted
                        playsInline
                      />
                      <div className="bc-video-play-badge">
                        <span className="bc-play-icon">▶</span>
                        <span>VIDEO</span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.src}
                      alt={item.label}
                      className="fm-photo-img"
                      draggable={false}
                      loading="lazy"
                    />
                  )}
                  <div className="fm-photo-label">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dirt Platform — always fixed at the bottom of the screen */}
        <div
          className="fm-dirt-platform fm-dirt-platform--gallery"
          style={{ backgroundImage: `url("${DIRT_TEXTURE_URI}")` }}
          aria-hidden="true"
        />

        {/* Lightbox for large viewing & download */}
        {lightboxIndex !== null && (
          <div
            className="bc-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Photo Viewer"
            onClick={() => setLightboxIndex(null)}
          >
            <div className="bc-lightbox-content" onClick={(e) => e.stopPropagation()}>
              {FRIDAY_MORNING_PHOTOS[lightboxIndex].type === 'video' ? (
                <video
                  src={FRIDAY_MORNING_PHOTOS[lightboxIndex].src}
                  controls
                  autoPlay
                  playsInline
                  className="bc-lightbox-media bc-lightbox-video"
                />
              ) : (
                <img
                  src={FRIDAY_MORNING_PHOTOS[lightboxIndex].src}
                  alt={FRIDAY_MORNING_PHOTOS[lightboxIndex].label}
                  className="bc-lightbox-media bc-lightbox-img"
                  draggable={false}
                />
              )}
              <div className="bc-lightbox-top-actions">
                <button
                  type="button"
                  className="bc-lightbox-download-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundManager.playButtonClick();
                    const link = document.createElement('a');
                    link.href = FRIDAY_MORNING_PHOTOS[lightboxIndex].src;
                    link.download = FRIDAY_MORNING_PHOTOS[lightboxIndex].filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  title={`Download ${FRIDAY_MORNING_PHOTOS[lightboxIndex].filename}`}
                >
                  <span style={{ fontSize: '0.85rem' }}>⬇</span>
                  <span>DOWNLOAD</span>
                </button>
                <button
                  type="button"
                  className="bc-lightbox-close"
                  onClick={() => setLightboxIndex(null)}
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Prev / Next */}
              <button
                type="button"
                className="bc-lightbox-prev"
                onClick={() => {
                  soundManager.playBlipSound();
                  setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1));
                }}
                disabled={lightboxIndex === 0}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                className="bc-lightbox-next"
                onClick={() => {
                  soundManager.playBlipSound();
                  setLightboxIndex((i) =>
                    Math.min(FRIDAY_MORNING_PHOTOS.length - 1, (i ?? 0) + 1)
                  );
                }}
                disabled={lightboxIndex === FRIDAY_MORNING_PHOTOS.length - 1}
                aria-label="Next photo"
              >
                ›
              </button>

              <div className="bc-lightbox-footer">
                <span className="bc-lightbox-filename">
                  {FRIDAY_MORNING_PHOTOS[lightboxIndex].label} ({FRIDAY_MORNING_PHOTOS[lightboxIndex].filename})
                </span>
                <span className="bc-lightbox-counter">
                  {lightboxIndex + 1} / {FRIDAY_MORNING_PHOTOS.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Scene: Achievement Unlocked ──────────────────────────────────────────
  if (stage === 'achievement') {
    return (
      <div
        className="fm-achievement-overlay"
        onClick={() => {
          soundManager.playButtonClick();
          setStage('gallery');
        }}
        role="region"
        aria-label="Achievement notification"
      >
        <div className="fm-achievement-panel" role="status" aria-live="polite">
          <div className="fm-achievement-badge">🏆 ACHIEVEMENT UNLOCKED!</div>
          <div className="fm-achievement-title">TSS GATEKEEPER</div>
          <div className="fm-achievement-quote">
            "Proved your loyalty. Earned your passage."
          </div>
          {playerName && (
            <div className="fm-achievement-player">
              ADVENTURER: {playerName.toUpperCase()} ({isFemale ? 'FEMALE' : 'MALE'})
            </div>
          )}
          <div className="fm-achievement-skip">Click anywhere to explore memories…</div>
        </div>
      </div>
    );
  }

  // ── Scene: Defeat / Elimination Screen ───────────────────────────────────
  if (stage === 'defeat') {
    return (
      <div className="fm-defeat-screen" role="region" aria-label="Elimination screen">
        <div className="fm-defeat-title">💥 YOU HAVE BEEN ELIMINATED!</div>
        <div className="fm-defeat-subtitle">
          You cannot enter the TSS Headquarters without joining the community.
        </div>
        <div className="fm-defeat-buttons">
          <a
            href="https://www.linkedin.com/company/the-software-society1"
            target="_blank"
            rel="noopener noreferrer"
            className="fm-social-btn linkedin"
            onClick={() => soundManager.playButtonClick()}
          >
            <span>🔗 FOLLOW TSS ON LINKEDIN</span>
          </a>
          <a
            href="https://www.instagram.com/the.software.society/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="fm-social-btn instagram"
            onClick={() => soundManager.playButtonClick()}
          >
            <span>📸 FOLLOW TSS ON INSTAGRAM</span>
          </a>
          <button
            type="button"
            className="fm-btn-try-again"
            onClick={() => {
              soundManager.playButtonClick();
              setStage('checkpoint_q1');
              setAmbushDialogueIdx(3); // Go straight to the loyalty question!
            }}
          >
            ↺ TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  // ── Scenes 1-5: The Playable Interactive Quest View ───────────────────────
  return (
    <div
      className={`fm-viewport fm-sky ${isNight ? 'fm-sky-ambush' : 'fm-sky-day'} ${
        isScreenShaking ? 'fm-screen-shake' : ''
      }`}
      role="main"
      aria-label="Friday Morning: The TSS Headquarters Quest"
    >
      {/* Top HUD */}
      <header className="fm-top-hud" style={{ justifyContent: 'flex-end' }}>
        <div className="fm-hud-badge">
          FRIDAY MORNING • {stage.replace(/_/g, ' ').toUpperCase()}
        </div>
      </header>

      {/* Floating voxel clouds */}
      <div className="fm-clouds-layer" aria-hidden="true">
        <img
          src="/assets/voxel-clouds.png"
          alt=""
          className="fm-cloud fm-cloud-1"
          draggable={false}
        />
        <img
          src="/assets/voxel-clouds.png"
          alt=""
          className="fm-cloud fm-cloud-2"
          draggable={false}
        />
        <img
          src="/assets/voxel-clouds.png"
          alt=""
          className="fm-cloud fm-cloud-3"
          draggable={false}
        />
      </div>

      {showDefeatFlash && <div className="fm-flash-overlay" aria-hidden="true" />}

      {/* Main Interactive Stage */}
      <div className="fm-stage">
        {/* Stone Castle on Right (Ref Image A & B) */}
        <img
          src="/assets/player/Castle.png"
          alt="TSS Stone Castle Headquarters"
          className="fm-castle"
          draggable={false}
        />

        {/* Hostile Mobs Group in front of Castle (Ref Image B) */}
        {showMobs && (
          <div
            className={`fm-mobs-wrapper ${
              stage === 'mob_spawn' ? 'fm-mobs-spawn-anim' : ''
            } ${
              stage === 'checkpoint_passed'
                ? 'fm-mobs-step-left'
                : stage === 'walking_into_castle'
                ? 'fm-mobs-fade-out'
                : ''
            }`}
            aria-hidden="true"
          >
            <img
              src="/assets/player/Mobs.png"
              alt="Minecraft Mobs Guarding Castle"
              className="fm-mobs-img"
              draggable={false}
            />
          </div>
        )}

        {/* Player Character with 8-Frame Walk Cycle */}
        <div
          className="fm-player"
          style={{ left: `${playerX}%` }}
          aria-label={`${playerName} (${isFemale ? 'Female' : 'Male'})`}
        >
          <img
            src={currentSpriteSrc}
            alt="Player Character"
            className="fm-player-sprite"
            draggable={false}
          />
          <div className="fm-player-shadow" aria-hidden="true" />
        </div>

        {/* Repeating Minecraft Dirt Platform on bottom */}
        <div
          className="fm-dirt-platform"
          style={{ backgroundImage: `url("${DIRT_TEXTURE_URI}")` }}
          aria-hidden="true"
        />

        {/* ── Dialogue Boxes & Checkpoint Interactions ───────────────────── */}

        {/* Scene 2: Admiring the Castle */}
        {stage === 'castle_admiration' && (
          <div className="fm-dialogue-overlay" role="region" aria-label="Dialogue">
            <div className="fm-dialogue-card" onClick={handleAdvanceCastleDialogue}>
              <div className="fm-dialogue-header">
                <span className="fm-speaker-badge fm-speaker-player">
                  {playerName.toUpperCase()}
                </span>
                <span className="fm-dialogue-progress">
                  {castleDialogueIdx + 1} / {CASTLE_DIALOGUE.length}
                </span>
              </div>
              <div className="fm-dialogue-text">
                "{CASTLE_DIALOGUE[castleDialogueIdx].text}"
              </div>
              <div className="fm-dialogue-actions">
                <button
                  type="button"
                  className="fm-btn-continue"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdvanceCastleDialogue();
                  }}
                >
                  {castleDialogueIdx < CASTLE_DIALOGUE.length - 1
                    ? 'CONTINUE ➔'
                    : 'APPROACH CASTLE ➔'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scene 3: Mob Confrontation Opening */}
        {stage === 'checkpoint_q1' && (
          <div className="fm-dialogue-overlay" role="region" aria-label="Mob Confrontation">
            <div className="fm-dialogue-card">
              <div className="fm-dialogue-header">
                <span
                  className={`fm-speaker-badge fm-speaker-${
                    AMBUSH_OPENING_DIALOGUE[ambushDialogueIdx].speaker
                  }`}
                >
                  {AMBUSH_OPENING_DIALOGUE[ambushDialogueIdx].name.toUpperCase()}
                </span>
                <span className="fm-dialogue-progress">LOYALTY CHECKPOINT • STEP 1/3</span>
              </div>
              <div className="fm-dialogue-text">
                "{AMBUSH_OPENING_DIALOGUE[ambushDialogueIdx].text}"
              </div>
              <div className="fm-dialogue-actions">
                {ambushDialogueIdx < AMBUSH_OPENING_DIALOGUE.length - 1 ? (
                  <button
                    type="button"
                    className="fm-btn-continue"
                    onClick={() => {
                      soundManager.playButtonClick();
                      setAmbushDialogueIdx((i) => i + 1);
                    }}
                  >
                    CONTINUE ➔
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="fm-btn-choice-yes"
                      onClick={() => {
                        soundManager.playButtonClick();
                        setStage('checkpoint_q2');
                      }}
                    >
                      ✓ YES, I FOLLOW TSS
                    </button>
                    <button
                      type="button"
                      className="fm-btn-choice-no"
                      onClick={() => triggerDefeat()}
                    >
                      ✕ NO, I DON'T
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scene 4: Confirmation 1 */}
        {stage === 'checkpoint_q2' && (
          <div className="fm-dialogue-overlay" role="region" aria-label="Confirmation 1">
            <div className="fm-dialogue-card">
              <div className="fm-dialogue-header">
                <span className="fm-speaker-badge fm-speaker-skeleton">SKELETON & ZOMBIE</span>
                <span className="fm-dialogue-progress">LOYALTY CHECKPOINT • STEP 2/3</span>
              </div>
              <div className="fm-dialogue-text">
                "Hmm... you say you follow TSS? You're absolutely sure?"
              </div>
              <div className="fm-dialogue-actions">
                <button
                  type="button"
                  className="fm-btn-choice-yes"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setStage('checkpoint_q3');
                  }}
                >
                  ✓ YES, I'M SURE
                </button>
                <button
                  type="button"
                  className="fm-btn-choice-no"
                  onClick={() => triggerDefeat()}
                >
                  ✕ WAIT... NO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scene 4: Confirmation 2 */}
        {stage === 'checkpoint_q3' && (
          <div className="fm-dialogue-overlay" role="region" aria-label="Confirmation 2">
            <div className="fm-dialogue-card">
              <div className="fm-dialogue-header">
                <span className="fm-speaker-badge fm-speaker-creeper">CREEPER</span>
                <span className="fm-dialogue-progress">LOYALTY CHECKPOINT • FINAL STEP</span>
              </div>
              <div className="fm-dialogue-text">
                "Last chance. No fake loyalty around here! You're really following The Software Society, right?"
              </div>
              <div className="fm-dialogue-actions">
                <button
                  type="button"
                  className="fm-btn-choice-yes"
                  onClick={() => {
                    soundManager.playSavePointSound();
                    setStage('checkpoint_passed');
                    setPassedDialogueIdx(0);
                  }}
                >
                  ✓ I SWEAR, I FOLLOW TSS
                </button>
                <button
                  type="button"
                  className="fm-btn-choice-no"
                  onClick={() => triggerDefeat()}
                >
                  ✕ I NEED TO FOLLOW FIRST
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scene 5: Checkpoint Passed Dialogue */}
        {stage === 'checkpoint_passed' && (
          <div className="fm-dialogue-overlay" role="region" aria-label="Checkpoint Passed">
            <div className="fm-dialogue-card" onClick={handleAdvancePassedDialogue}>
              <div className="fm-dialogue-header">
                <span
                  className={`fm-speaker-badge fm-speaker-${
                    PASSED_DIALOGUE[passedDialogueIdx].speaker
                  }`}
                >
                  {PASSED_DIALOGUE[passedDialogueIdx].name.toUpperCase()}
                </span>
                <span className="fm-dialogue-progress">
                  {passedDialogueIdx + 1} / {PASSED_DIALOGUE.length}
                </span>
              </div>
              <div className="fm-dialogue-text">
                "{PASSED_DIALOGUE[passedDialogueIdx].text}"
              </div>
              <div className="fm-dialogue-actions">
                <button
                  type="button"
                  className="fm-btn-continue"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdvancePassedDialogue();
                  }}
                >
                  {passedDialogueIdx < PASSED_DIALOGUE.length - 1
                    ? 'CONTINUE ➔'
                    : 'ENTER CASTLE ➔'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
