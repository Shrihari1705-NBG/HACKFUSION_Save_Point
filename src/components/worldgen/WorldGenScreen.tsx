import React, { useEffect, useState, useRef, useCallback } from 'react';
import { soundManager } from '../../utils/sound';
import { DIRT_TEXTURE_URI } from '../../utils/textures';
import { Volume2, VolumeX } from 'lucide-react';
import './worldGen.css';

interface WorldGenScreenProps {
  onComplete: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const STATUS_MESSAGES = [
  { min: 0, max: 15, text: 'Preparing spawn area...' },
  { min: 16, max: 35, text: 'Generating terrain...' },
  { min: 36, max: 55, text: 'Placing blocks & crafting memories...' },
  { min: 56, max: 75, text: 'Recovering lost semicolons...' },
  { min: 76, max: 88, text: 'Summoning the HackFusion crew...' },
  { min: 89, max: 99, text: 'Finalizing chunk borders...' },
  { min: 100, max: 100, text: 'WORLD READY!' },
];

export const WorldGenScreen: React.FC<WorldGenScreenProps> = ({
  onComplete,
  soundEnabled,
  onToggleSound,
}) => {
  const [percent, setPercent] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Preparing spawn area...');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef<boolean>(false);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Function to finish generation and transition
  const handleFinish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPercent(100);
    setStatusText('WORLD READY!');
    soundManager.playWorldReadySound();

    setIsTransitioning(true);
    const timer = setTimeout(() => {
      onComplete();
    }, 700);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Stepped progress simulation matching authentic Minecraft world gen
  useEffect(() => {
    if (prefersReducedMotion) {
      handleFinish();
      return;
    }

    // Sequence of realistic stepped progress checkpoints
    // 36% is intentionally included as a key milestone matching the reference screenshot!
    const milestones = [
      { p: 0, delay: 0 },
      { p: 7, delay: 280 },
      { p: 18, delay: 650 },
      { p: 29, delay: 1100 },
      { p: 36, delay: 1450 }, // Exact reference screenshot percentage!
      { p: 48, delay: 1950 },
      { p: 61, delay: 2400 },
      { p: 74, delay: 2850 },
      { p: 87, delay: 3350 },
      { p: 96, delay: 3800 },
      { p: 100, delay: 4200 },
    ];

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    milestones.forEach(({ p, delay }) => {
      const t = setTimeout(() => {
        if (completedRef.current) return;
        setPercent(p);

        // Update status text
        const found = STATUS_MESSAGES.find((m) => p >= m.min && p <= m.max);
        if (found) {
          setStatusText(found.text);
        }

        // Sound effect tick
        if (p > 0 && p < 100) {
          soundManager.playWorldGenTick();
        } else if (p === 100) {
          handleFinish();
        }
      }, delay);
      timeouts.push(t);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [handleFinish, prefersReducedMotion]);

  // Canvas chunk rendering logic:
  // Draws the authentic Minecraft Java Edition world generation grid:
  // - Starts with empty light gray grid (#bfbfbf)
  // - At 0-40%: Center white spawn chunks generate outward with blocky jagged edges (matching screenshot!)
  // - At 40-100%: Biome terrain colors reveal: grass, dirt, river, trees, stone, and glowing HackFusion beacon!
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed internal resolution: 64x64 chunks for crisp pixelated rendering
    const size = 64;
    canvas.width = size;
    canvas.height = size;

    const render = () => {
      // 1. Base light grey canvas (matching reference screenshot background)
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(0, 0, size, size);

      // 2. Draw subtle ungenerated chunk grid lines
      ctx.fillStyle = '#b3b3b3';
      for (let i = 0; i < size; i += 4) {
        ctx.fillRect(i, 0, 1, size);
        ctx.fillRect(0, i, size, 1);
      }

      const p = percent;
      const center = size / 2;

      // 3. Radius of generated chunks expands with progress
      // At 36%: radius ~ 14px (reproduces reference image inner white square)
      const currentRadius = Math.max(0, (p / 100) * (size * 0.72));

      // Deterministic pseudo-random chunk generator
      const getChunkLoaded = (x: number, y: number, r: number) => {
        const dx = x - center;
        const dy = y - center;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Add chunky noise to boundary
        const noise = (Math.sin(x * 12.5) + Math.cos(y * 14.2) + Math.sin((x + y) * 8.1)) * 1.8;
        return dist + noise <= r;
      };

      // 4. Fill generated chunks
      // For p < 45: white chunk blocks (just like Minecraft 1.16 screenshot)
      // For p >= 45: terrain colors blend in smoothly (grass, dirt, stone, water, beacon)
      for (let y = 0; y < size; y += 2) {
        for (let x = 0; x < size; x += 2) {
          if (getChunkLoaded(x, y, currentRadius)) {
            if (p < 45) {
              // Exact reference screenshot state: solid crisp white chunk blocks with slight highlight
              ctx.fillStyle = (x + y) % 6 === 0 ? '#f0f0f0' : '#ffffff';
              ctx.fillRect(x, y, 2, 2);
            } else {
              // Transition to rich HackFusion terrain
              const terrainProgress = (p - 45) / 55; // 0 to 1

              // Deterministic terrain layout
              const distFromCenter = Math.hypot(x - center, y - center);
              const isRiver = Math.abs(y - (center + Math.sin(x * 0.15) * 6)) < 3 && x > 14 && x < 52;
              const isMountain = distFromCenter > 16 && (x < 22 || y < 20);
              const isBeacon = Math.hypot(x - center, y - center) < 3.2;

              let color = '#5b8731'; // grass base

              if (isBeacon) {
                // Checkpoint Beacon in center
                color = (Date.now() / 200) % 2 > 1 ? '#38bdf8' : '#facc15';
              } else if (isRiver) {
                color = '#3f76e4'; // water stream
              } else if (isMountain) {
                color = (x + y) % 4 === 0 ? '#5a5a5a' : '#707070'; // stone peaks
              } else {
                // Grassland with flower/dirt speckles
                const seed = (x * 37 + y * 19) % 100;
                if (seed > 88) color = '#f472b6'; // wild rose flower
                else if (seed > 80) color = '#facc15'; // dandelion flower
                else if (seed > 65) color = '#739d34'; // lush grass
                else if (seed < 12) color = '#866043'; // dirt path
                else color = '#5b8731';
              }

              // Blend from white to terrain colors based on terrainProgress
              if (terrainProgress < 0.6) {
                ctx.fillStyle = Math.random() > terrainProgress ? '#ffffff' : color;
              } else {
                ctx.fillStyle = color;
              }
              ctx.fillRect(x, y, 2, 2);
            }
          }
        }
      }

      // Draw active chunk boundary pulse on outer edge
      if (p > 5 && p < 100) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
      }
    };

    render();
  }, [percent]);

  return (
    <div
      className={`worldgen-screen ${isTransitioning ? 'worldgen-dissolve' : ''}`}
      style={{
        backgroundImage: `radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%), url("${DIRT_TEXTURE_URI}")`,
      }}
      role="region"
      aria-label="HackFusion 2.0 World Generation"
    >
      {/* Top HUD with audio control */}
      <header className="worldgen-header">
        <div className="worldgen-brand">
          <span className="brand-badge">HACKFUSION 2.0</span>
        </div>
        <button
          type="button"
          onClick={onToggleSound}
          className="mc-hud-btn"
          aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {soundEnabled ? (
            <>
              <Volume2 size={14} aria-hidden="true" />
              <span>SFX: ON</span>
            </>
          ) : (
            <>
              <VolumeX size={14} aria-hidden="true" />
              <span>SFX: OFF</span>
            </>
          )}
        </button>
      </header>

      {/* Main Centered Content */}
      <div className="worldgen-center">
        {/* Centered Percentage Label - Exactly matching reference screenshot */}
        <div
          className="worldgen-percentage"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {percent}%
        </div>

        {/* Playful HackFusion Status Text */}
        <div className="worldgen-status-text">
          {statusText}
        </div>

        {/* The Generation Square - Strict reproduction of reference screenshot */}
        <div className="worldgen-frame-outer">
          <div className="worldgen-frame-grey">
            <div className="worldgen-frame-indigo">
              <div className="worldgen-frame-green">
                <div className="worldgen-viewport">
                  <canvas
                    ref={canvasRef}
                    className="worldgen-canvas"
                    aria-hidden="true"
                  />
                  {/* Subtle pixel grid scanline overlay */}
                  <div className="worldgen-canvas-overlay" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Retro Skip / Enter Button */}
        <div className="worldgen-action-bar">
          <button
            type="button"
            className="mc-game-btn worldgen-skip-btn"
            onClick={handleFinish}
            aria-label="Skip world generation intro"
          >
            {percent === 100 ? 'ENTER WORLD' : 'SKIP GENERATION'}
          </button>
        </div>
      </div>

      {/* Footer System Info */}
      <footer className="worldgen-footer">
        <span className="worldgen-info">
          HackFusion v2.0 • The Software Society • Save Point Memory Engine
        </span>
      </footer>
    </div>
  );
};
