import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, Sparkles, Compass, Heart } from 'lucide-react';
import { soundManager } from './utils/sound';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const messageRef = useRef<HTMLParagraphElement>(null);

  // Prevent right-click / context menu and dragging globally
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Prevent context menu (Save image as...)
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundManager.enabled = nextState;
    if (nextState) {
      soundManager.playBlipSound();
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Play retro savepoint chime
    soundManager.playSavePointSound();

    // Trigger Minecraft/voxel themed confetti
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 45,
      spread: 70,
      origin: { x, y },
      colors: ['#38bdf8', '#fb7185', '#facc15', '#4ade80', '#c084fc', '#ffffff'],
      shapes: ['square'], // Voxel/pixel block confetti!
      scalar: 1.2,
      ticks: 200,
    });

    setIsSaved(true);

    // Scroll gently to the message area if needed
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <main className="savepoint-viewport" role="main">
      {/* Dynamic Voxel Sky Background */}
      <div className="sky-canvas" aria-hidden="true">
        {/* Subtle atmospheric ambient glow */}
        <div className="sun-bloom" />
        <div className="sky-gradient-overlay" />
      </div>

      {/* Sound Toggle (Top-Right HUD element) */}
      <nav className="game-hud" aria-label="Game settings">
        <div className="hud-badge">
          <Compass className="hud-icon spin-subtle" size={14} aria-hidden="true" />
          <span>HACKATHON CHECKPOINT</span>
        </div>
        <button
          type="button"
          onClick={toggleSound}
          className="hud-btn"
          aria-label={soundEnabled ? "Mute 8-bit sound effects" : "Enable 8-bit sound effects"}
          title={soundEnabled ? "Mute 8-bit sound effects" : "Enable 8-bit sound effects"}
        >
          {soundEnabled ? (
            <>
              <Volume2 size={16} aria-hidden="true" />
              <span className="hud-btn-text">SFX: ON</span>
            </>
          ) : (
            <>
              <VolumeX size={16} aria-hidden="true" />
              <span className="hud-btn-text">SFX: OFF</span>
            </>
          )}
        </button>
      </nav>

      {/* Floating Voxel Clouds (Upper Section) */}
      <div className="cloud-layer" aria-hidden="true">
        {/* Cloud 1: Main High Floating Voxel Cloud */}
        <div className="cloud-wrapper cloud-anim-1">
          <img
            src="/assets/voxel-clouds.png"
            alt=""
            className="voxel-cloud cloud-size-lg"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* Cloud 2: Drifting Mid-Altitude Cloud */}
        <div className="cloud-wrapper cloud-anim-2">
          <img
            src="/assets/voxel-clouds.png"
            alt=""
            className="voxel-cloud cloud-size-md"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* Cloud 3: Distant Soft Cloud */}
        <div className="cloud-wrapper cloud-anim-3">
          <img
            src="/assets/voxel-clouds.png"
            alt=""
            className="voxel-cloud cloud-size-sm"
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>

      {/* Floating Retro Motes / Fireflies in the sunset air */}
      <div className="ambient-particles" aria-hidden="true">
        <span className="particle p1" />
        <span className="particle p2" />
        <span className="particle p3" />
        <span className="particle p4" />
        <span className="particle p5" />
        <span className="particle p6" />
      </div>

      {/* Main Content Area (Open Sky Section) */}
      <div className="content-container">
        <div className="hero-card">
          {/* Beacon / Save Point Top Tag */}
          <div className="save-badge-container">
            <div className="save-badge">
              <span className="save-beacon-dot" />
              <Sparkles size={13} className="sparkle-icon" aria-hidden="true" />
              <span className="save-badge-text">CHECKPOINT UNLOCKED</span>
            </div>
          </div>

          {/* Primary Titles */}
          <header className="hero-header">
            <h1 className="title-hackfusion">
              HACKFUSION 2.0
            </h1>
            <p className="subtitle-savepoint">
              THE SAVE POINT
            </p>
          </header>

          {/* Inspiring Message */}
          <section className="adventure-message-block" aria-label="Event Status">
            <h2 className="adventure-headline">
              YOUR ADVENTURE IS WAITING...
            </h2>
            <blockquote className="adventure-quote">
              “The world is ready. The memories are yet to be made.”
            </blockquote>
          </section>

          {/* Interactive Game-style Button */}
          <div className="action-section">
            <button
              type="button"
              className="game-btn voxel-btn"
              onClick={handleButtonClick}
              id="memories-btn"
              aria-describedby="saved-message"
            >
              <span className="btn-shine" aria-hidden="true" />
              <span className="btn-pixel-icon" aria-hidden="true">★</span>
              <span className="btn-text">MEMORIES COMING SOON</span>
              <span className="btn-pixel-icon" aria-hidden="true">★</span>
            </button>

            {/* Authentic Minecraft-style Checkpoint / Achievement Notification */}
            {isSaved && (
              <div className="mc-toast-wrapper" role="status" aria-live="polite">
                <div className="mc-achievement-box">
                  <div className="mc-item-slot">
                    <span className="mc-slot-icon" aria-hidden="true">★</span>
                  </div>
                  <div className="mc-achievement-text">
                    <span className="mc-achievement-title">CHECKPOINT SAVED!</span>
                    <span className="mc-achievement-desc">Memories will unlock right here.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Below-button subtitle */}
            <p
              id="saved-message"
              ref={messageRef}
              className={`memory-subtitle ${isSaved ? 'highlight-pulse' : ''}`}
            >
              “A little piece of HackFusion, saved for you.”
            </p>
          </div>
        </div>
      </div>

      {/* Sunset Mountains Landscape (Bottom Section) */}
      <footer className="landscape-anchor" aria-hidden="true">
        <div className="mountain-reflection-wrapper">
          <img
            src="/assets/sunset-landscape.png"
            alt="Voxel Sunset Mountains with water reflection and grass blocks"
            className="sunset-mountain-img"
            loading="eager"
            draggable={false}
          />
        </div>
      </footer>

      {/* Clean Footer Bar */}
      <div className="site-footer">
        <p className="footer-text">
          MADE WITH <Heart size={14} className="heart-icon" fill="currentColor" aria-hidden="true" /> BY THE SOFTWARE SOCIETY
        </p>
      </div>
    </main>
  );
}
