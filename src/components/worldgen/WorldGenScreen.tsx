import React, { useEffect, useState, useRef, useCallback } from 'react';
import { soundManager } from '../../utils/sound';
import { DIRT_TEXTURE_URI } from '../../utils/textures';
import { assetPreloader, PreloadProgress } from '../../utils/assetPreloader';
import { Volume2, VolumeX } from 'lucide-react';
import './worldGen.css';

interface WorldGenScreenProps {
  onComplete: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const WorldGenScreen: React.FC<WorldGenScreenProps> = ({
  onComplete,
  soundEnabled,
  onToggleSound,
}) => {
  const [percent, setPercent] = useState<number>(0);
  const [progressState, setProgressState] = useState<PreloadProgress>(() =>
    assetPreloader.getProgress()
  );
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef<boolean>(false);
  const targetPercentRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Audio unlock on first user gesture
  useEffect(() => {
    const unlock = () => {
      soundManager.unlock();
      document.removeEventListener('click', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
      document.removeEventListener('keydown', unlock, true);
    };
    document.addEventListener('click', unlock, true);
    document.addEventListener('touchstart', unlock, true);
    document.addEventListener('keydown', unlock, true);
    return () => {
      document.removeEventListener('click', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
      document.removeEventListener('keydown', unlock, true);
    };
  }, []);

  // Transition into the game
  const handleFinish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPercent(100);
    soundManager.playWorldReadySound();

    setIsTransitioning(true);
    const timer = setTimeout(() => {
      onComplete();
    }, 700);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Hook into real AssetPreloader
  useEffect(() => {
    if (prefersReducedMotion) {
      assetPreloader.preloadAll();
      handleFinish();
      return;
    }

    // Subscribe to real progress events
    const unsubscribe = assetPreloader.subscribe((p) => {
      setProgressState(p);
      targetPercentRef.current = p.percentage;
    });

    // Start real preloading
    assetPreloader.preloadAll();

    // Smoothly step the display percentage toward the actual loaded percentage
    let lastSoundPercent = 0;
    const step = () => {
      if (completedRef.current) return;

      setPercent((current) => {
        const target = targetPercentRef.current;
        if (current < target) {
          const next = Math.min(target, current + Math.max(1, Math.floor((target - current) * 0.25)));

          // Play tick sound on milestones
          if (next - lastSoundPercent >= 8 && next < 100) {
            lastSoundPercent = next;
            soundManager.playWorldGenTick();
          }

          if (next >= 100 && (progressState.isComplete || progressState.isCriticalComplete)) {
            // World generation is finished!
            setTimeout(() => {
              handleFinish();
            }, 600);
          }

          return next;
        }
        return current;
      });

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      unsubscribe();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [handleFinish, prefersReducedMotion, progressState.isComplete, progressState.isCriticalComplete]);

  // Canvas chunk rendering logic:
  // Draws authentic Minecraft Java Edition world generation grid
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
      // 1. Base light grey canvas
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(0, 0, size, size);

      // 2. Ungenerated chunk grid lines
      ctx.fillStyle = '#b3b3b3';
      for (let i = 0; i < size; i += 4) {
        ctx.fillRect(i, 0, 1, size);
        ctx.fillRect(0, i, size, 1);
      }

      const p = percent;
      const center = size / 2;

      // 3. Radius of generated chunks expands with progress
      const currentRadius = Math.max(0, (p / 100) * (size * 0.72));

      // Deterministic pseudo-random chunk boundary
      const getChunkLoaded = (x: number, y: number, r: number) => {
        const dx = x - center;
        const dy = y - center;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const noise = (Math.sin(x * 12.5) + Math.cos(y * 14.2) + Math.sin((x + y) * 8.1)) * 1.8;
        return dist + noise <= r;
      };

      // 4. Fill generated chunks
      for (let y = 0; y < size; y += 2) {
        for (let x = 0; x < size; x += 2) {
          if (getChunkLoaded(x, y, currentRadius)) {
            if (p < 45) {
              // Solid crisp white chunk blocks with subtle variation
              ctx.fillStyle = (x + y) % 6 === 0 ? '#f0f0f0' : '#ffffff';
              ctx.fillRect(x, y, 2, 2);
            } else {
              // Rich HackFusion terrain blends in
              const terrainProgress = (p - 45) / 55;
              const distFromCenter = Math.hypot(x - center, y - center);
              const isRiver = Math.abs(y - (center + Math.sin(x * 0.15) * 6)) < 3 && x > 14 && x < 52;
              const isMountain = distFromCenter > 16 && (x < 22 || y < 20);
              const isBeacon = Math.hypot(x - center, y - center) < 3.2;

              let color = '#5b8731'; // grass base

              if (isBeacon) {
                color = (Date.now() / 200) % 2 > 1 ? '#38bdf8' : '#facc15';
              } else if (isRiver) {
                color = '#3f76e4';
              } else if (isMountain) {
                color = (x + y) % 4 === 0 ? '#5a5a5a' : '#707070';
              } else {
                const seed = (x * 37 + y * 19) % 100;
                if (seed > 88) color = '#f472b6';
                else if (seed > 80) color = '#facc15';
                else if (seed > 65) color = '#739d34';
                else if (seed < 12) color = '#866043';
                else color = '#5b8731';
              }

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

  const isReady = percent >= 100 || progressState.isComplete || progressState.isCriticalComplete;

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
        {/* Centered Percentage Label */}
        <div
          className="worldgen-percentage"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {percent}%
        </div>

        {/* Status Text reflecting genuine work performed */}
        <div className="worldgen-status-text">
          {percent >= 100
            ? progressState.failed > 0
              ? 'WORLD GENERATED (WITH FALLBACKS)'
              : 'WORLD GENERATED SUCCESSFULLY!'
            : progressState.currentTask}
        </div>

        {/* Real Asset Counter */}
        <div className="worldgen-asset-counter">
          [{progressState.completed} / {progressState.total} ASSETS PREPARED]
        </div>

        {/* Pixel Progress Track */}
        <div className="worldgen-progress-track" aria-hidden="true">
          <div
            className="worldgen-progress-fill"
            style={{ width: `${percent}%` }}
          />
        </div>

        {progressState.failed > 0 && (
          <div className="worldgen-fallback-badge">
            Note: {progressState.failed} optional preview(s) used fallback
          </div>
        )}

        {/* The Generation Square */}
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

        {/* Action Button: Skip or Enter World */}
        <div className="worldgen-action-bar">
          <button
            type="button"
            className="mc-game-btn worldgen-skip-btn"
            onClick={handleFinish}
            aria-label={isReady ? 'Enter World' : 'Skip world generation intro'}
          >
            {isReady ? 'ENTER WORLD ➔' : 'SKIP GENERATION'}
          </button>
        </div>
      </div>

      {/* Footer System Info */}
      <footer className="worldgen-footer">
        <span className="worldgen-info">
          HackFusion v2.0 • The Software Society • Memory Preloader Engine
        </span>
      </footer>
    </div>
  );
};
