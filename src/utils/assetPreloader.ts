/**
 * assetPreloader.ts
 * Real Asset Preloading & Resource Management Engine for HackFusion 2.0 Save Point
 *
 * Capabilities:
 * - Priority-based loading (Priority A: Critical to initial world; Priority B: Secondary / Video metadata)
 * - True progress tracking based on completed assets
 * - Image preloading & HTMLImageElement.decode() to eliminate render lag
 * - Video metadata & poster extraction via offscreen canvas (avoids preloading 137MB+ video files)
 * - Font preloading via document.fonts
 * - Automatic retry with exponential backoff on transient network failures
 * - Promise.allSettled error tolerance (never freezes on missing or failing assets)
 * - Cache of preloaded assets & decoded Image elements to prevent duplicate network requests
 */

export interface PreloadProgress {
  total: number;
  completed: number;
  loaded: number;
  failed: number;
  percentage: number;
  currentTask: string;
  isComplete: boolean;
  isCriticalComplete: boolean;
  hasErrors: boolean;
  failedItems: string[];
}

export interface AssetDefinition {
  id: string;
  url: string;
  type: 'image' | 'video_meta' | 'font';
  priority: 'critical' | 'secondary';
  label: string;
  taskLabel: string;
}

// Complete manifest of assets for Stage 1 (World 1: Decoration and Prep)
export const WORLD_1_MANIFEST: AssetDefinition[] = [
  // ── Priority A: Critical ──────────────────────────────────────────────────
  {
    id: 'font-pixel',
    url: 'Press Start 2P',
    type: 'font',
    priority: 'critical',
    label: 'Pixel Typography',
    taskLabel: 'Loading pixel fonts...',
  },
  {
    id: 'chest-sprite',
    url: '/assets/Bonus_chest.png',
    type: 'image',
    priority: 'critical',
    label: 'Bonus Chest Artwork',
    taskLabel: 'Preparing memory chests...',
  },
  {
    id: 'voxel-clouds',
    url: '/assets/voxel-clouds.png',
    type: 'image',
    priority: 'critical',
    label: 'Voxel Clouds',
    taskLabel: 'Generating sky & cloud terrain...',
  },
  {
    id: 'village-landscape',
    url: '/assets/village-cutout.png',
    type: 'image',
    priority: 'critical',
    label: 'Minecraft Village Artwork',
    taskLabel: 'Preparing the village...',
  },
  {
    id: 'world-thumb-w1',
    url: '/assets/Decoration_and_prep.png',
    type: 'image',
    priority: 'critical',
    label: 'Decoration & Prep Thumbnail',
    taskLabel: 'Loading world entries...',
  },
  {
    id: 'world-thumb-w2',
    url: '/assets/Friday_morning.png',
    type: 'image',
    priority: 'critical',
    label: 'Friday Morning Thumbnail',
    taskLabel: 'Loading world entries...',
  },
  {
    id: 'world-thumb-w3',
    url: '/assets/Jamming_night.png',
    type: 'image',
    priority: 'critical',
    label: 'Jamming Night Thumbnail',
    taskLabel: 'Loading world entries...',
  },
  {
    id: 'world-thumb-w4',
    url: '/assets/End_memories.png',
    type: 'image',
    priority: 'critical',
    label: 'End Memories Thumbnail',
    taskLabel: 'Loading world entries...',
  },
  {
    id: 'photo-prep-1',
    url: '/assets/memories/IMG_6220.jpg',
    type: 'image',
    priority: 'critical',
    label: 'Memory Photo #1',
    taskLabel: 'Loading event photographs...',
  },
  {
    id: 'photo-prep-2',
    url: '/assets/memories/IMG_6236.jpg',
    type: 'image',
    priority: 'critical',
    label: 'Memory Photo #2',
    taskLabel: 'Loading event photographs...',
  },

  // ── Priority B: Secondary (Video metadata and poster frames) ───────────────
  {
    id: 'video-prep-1-meta',
    url: '/assets/memories/IMG_6193.MOV',
    type: 'video_meta',
    priority: 'secondary',
    label: 'Prep Video #1 Preview',
    taskLabel: 'Preparing video previews...',
  },
  {
    id: 'video-prep-2-meta',
    url: '/assets/memories/IMG_6199.MOV',
    type: 'video_meta',
    priority: 'secondary',
    label: 'Prep Video #2 Preview',
    taskLabel: 'Preparing video previews...',
  },
  {
    id: 'video-prep-3-meta',
    url: '/assets/memories/IMG_6219.MOV',
    type: 'video_meta',
    priority: 'secondary',
    label: 'Prep Video #3 Preview',
    taskLabel: 'Preparing video previews...',
  },
];

// Manifest of assets for Stage 2 (World 2: Friday Morning)
export const WORLD_2_MANIFEST: AssetDefinition[] = [
  {
    id: 'w2-castle',
    url: '/assets/player/Castle.png',
    type: 'image',
    priority: 'critical',
    label: 'TSS Castle Headquarters',
    taskLabel: 'Generating TSS Castle...',
  },
  {
    id: 'w2-mobs',
    url: '/assets/player/Mobs.png',
    type: 'image',
    priority: 'critical',
    label: 'Hostile Mob Outpost',
    taskLabel: 'Summoning castle sentries...',
  },
  // Character walk cycles (Frames 1-8 for male & female)
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
    id: `w2-male-${i}`,
    url: `/assets/player/Male/M${i}.png`,
    type: 'image' as const,
    priority: 'critical' as const,
    label: `Male Frame ${i}`,
    taskLabel: 'Preparing character sprites...',
  })),
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
    id: `w2-female-${i}`,
    url: `/assets/player/Female/F${i}.png`,
    type: 'image' as const,
    priority: 'critical' as const,
    label: `Female Frame ${i}`,
    taskLabel: 'Preparing character sprites...',
  })),
  // Friday Morning Memory Photos
  {
    id: 'w2-photo-1',
    url: '/assets/memories/friday_morning/IMG_6234.JPG',
    type: 'image',
    priority: 'critical',
    label: 'Friday Morning Photo #1',
    taskLabel: 'Loading Friday Morning memories...',
  },
  {
    id: 'w2-photo-2',
    url: '/assets/memories/friday_morning/IMG_6238.JPG',
    type: 'image',
    priority: 'critical',
    label: 'Friday Morning Photo #2',
    taskLabel: 'Loading Friday Morning memories...',
  },
  {
    id: 'w2-photo-3',
    url: '/assets/memories/friday_morning/IMG_6245.JPG',
    type: 'image',
    priority: 'critical',
    label: 'Friday Morning Photo #3',
    taskLabel: 'Loading Friday Morning memories...',
  },
  {
    id: 'w2-photo-4',
    url: '/assets/memories/friday_morning/IMG_6253.JPG',
    type: 'image',
    priority: 'critical',
    label: 'Friday Morning Photo #4',
    taskLabel: 'Loading Friday Morning memories...',
  },
  {
    id: 'w2-photo-5',
    url: '/assets/memories/friday_morning/IMG_6277.JPG',
    type: 'image',
    priority: 'critical',
    label: 'Friday Morning Photo #5',
    taskLabel: 'Loading Friday Morning memories...',
  },
  {
    id: 'w2-photo-6',
    url: '/assets/memories/friday_morning/IMG_6283.JPG',
    type: 'image',
    priority: 'critical',
    label: 'Friday Morning Photo #6',
    taskLabel: 'Loading Friday Morning memories...',
  },
];

type ProgressListener = (progress: PreloadProgress) => void;

class AssetPreloader {
  private imageCache = new Map<string, HTMLImageElement>();
  private videoPosters = new Map<string, string>();
  private listeners = new Set<ProgressListener>();

  private progress: PreloadProgress = {
    total: WORLD_1_MANIFEST.length,
    completed: 0,
    loaded: 0,
    failed: 0,
    percentage: 0,
    currentTask: 'Initializing world preloader...',
    isComplete: false,
    isCriticalComplete: false,
    hasErrors: false,
    failedItems: [],
  };

  private preloadPromise: Promise<PreloadProgress> | null = null;

  public subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.progress });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getProgress(): PreloadProgress {
    return { ...this.progress };
  }

  public getImage(url: string): HTMLImageElement | undefined {
    return this.imageCache.get(url);
  }

  public getVideoPoster(url: string): string | undefined {
    return this.videoPosters.get(url);
  }

  private notify() {
    const snapshot = { ...this.progress };
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('Error in preloader listener:', err);
      }
    });
  }

  /**
   * Start loading all assets in the manifest according to priorities.
   * Safe to call multiple times (returns existing singleton promise).
   */
  public preloadAll(): Promise<PreloadProgress> {
    if (this.preloadPromise) {
      return this.preloadPromise;
    }

    this.preloadPromise = this.executePreload();
    return this.preloadPromise;
  }

  /**
   * Preload a specific manifest of assets (e.g. World 2)
   */
  public async preloadManifest(manifest: AssetDefinition[]): Promise<void> {
    for (const asset of manifest) {
      if (asset.type === 'image') {
        await this.loadImageWithRetry(asset.url, 1).catch(() => {});
      }
    }
  }

  private async executePreload(): Promise<PreloadProgress> {
    const criticalAssets = WORLD_1_MANIFEST.filter((a) => a.priority === 'critical');
    const secondaryAssets = WORLD_1_MANIFEST.filter((a) => a.priority === 'secondary');

    this.progress.total = WORLD_1_MANIFEST.length;
    this.progress.completed = 0;
    this.progress.loaded = 0;
    this.progress.failed = 0;
    this.progress.currentTask = 'Starting world asset generation...';
    this.notify();

    // 1. Load Critical (Priority A) assets first
    for (const asset of criticalAssets) {
      this.progress.currentTask = asset.taskLabel;
      this.notify();

      await this.loadSingleAsset(asset);
    }

    this.progress.isCriticalComplete = true;

    // 2. Load Secondary (Priority B) assets in background
    for (const asset of secondaryAssets) {
      this.progress.currentTask = asset.taskLabel;
      this.notify();

      await this.loadSingleAsset(asset);
    }

    // Finished
    this.progress.isComplete = true;
    this.progress.currentTask =
      this.progress.failed > 0
        ? 'World generated with fallback assets'
        : 'WORLD GENERATED SUCCESSFULLY!';
    this.progress.percentage = 100;
    this.notify();

    return this.progress;
  }

  private async loadSingleAsset(asset: AssetDefinition): Promise<void> {
    let success = false;

    try {
      if (asset.type === 'font') {
        success = await this.loadFont(asset.url);
      } else if (asset.type === 'image') {
        success = await this.loadImageWithRetry(asset.url, 2);
      } else if (asset.type === 'video_meta') {
        success = await this.prepareVideoMetadata(asset.url);
      }
    } catch {
      success = false;
    }

    this.progress.completed++;
    if (success) {
      this.progress.loaded++;
    } else {
      this.progress.failed++;
      this.progress.hasErrors = true;
      this.progress.failedItems.push(asset.label);
    }

    this.progress.percentage = Math.floor(
      (this.progress.completed / this.progress.total) * 100
    );
    this.notify();
  }

  /**
   * Font preloading with safety timeout
   */
  private async loadFont(fontFamily: string): Promise<boolean> {
    if (typeof document === 'undefined' || !document.fonts) {
      return true; // Fallback gracefully if Font Loading API not available
    }

    try {
      await Promise.race([
        Promise.all([
          document.fonts.load(`16px "${fontFamily}"`),
          document.fonts.ready,
        ]),
        new Promise((r) => setTimeout(r, 2000)), // Don't block beyond 2s
      ]);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Preload an image, decode it, and cache the HTMLImageElement.
   * Includes up to `maxRetries` attempts for network drops.
   */
  private async loadImageWithRetry(url: string, maxRetries = 2): Promise<boolean> {
    if (this.imageCache.has(url)) {
      return true;
    }

    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const img = new Image();
        img.decoding = 'async';

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          img.src = url;

          // If already cached by browser
          if (img.complete && img.naturalWidth > 0) {
            resolve();
          }
        });

        // Trigger native asynchronous decoding if available
        if ('decode' in img && typeof img.decode === 'function') {
          try {
            await img.decode();
          } catch {
            // Some browsers reject decode() on valid images in background tabs; safe to ignore
          }
        }

        this.imageCache.set(url, img);
        return true;
      } catch (err) {
        attempt++;
        if (attempt > maxRetries) {
          console.warn(`[AssetPreloader] Image failed after ${maxRetries} retries: ${url}`, err);
          return false;
        }
        // Small backoff before retrying
        await new Promise((r) => setTimeout(r, attempt * 250));
      }
    }
    return false;
  }

  /**
   * Video Strategy: Preload metadata only (not full ~100MB video!),
   * and capture a poster frame using an offscreen canvas.
   * This completely prevents layout shift and black video rectangles.
   */
  private prepareVideoMetadata(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof document === 'undefined') {
        return resolve(true);
      }

      if (this.videoPosters.has(url)) {
        return resolve(true);
      }

      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.crossOrigin = 'anonymous';

      let settled = false;

      const cleanup = () => {
        video.onloadedmetadata = null;
        video.onseeked = null;
        video.onerror = null;
        video.removeAttribute('src');
        video.load();
      };

      // 3.5s timeout safeguard so MOV codec quirks never hold up the loader
      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          cleanup();
          resolve(true); // Don't treat video poster timeout as fatal error
        }
      }, 3500);

      video.onloadedmetadata = () => {
        // Seek to 0.4s to avoid potential black starting frames
        const seekTarget = Math.min(0.4, (video.duration || 1) / 2);
        try {
          video.currentTime = seekTarget;
        } catch {
          if (!settled) {
            settled = true;
            clearTimeout(timeout);
            cleanup();
            resolve(true);
          }
        }
      };

      video.onseeked = () => {
        if (settled) return;
        try {
          const width = video.videoWidth || 320;
          const height = video.videoHeight || 240;
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(width, 480);
          canvas.height = Math.min(height, 360);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const posterData = canvas.toDataURL('image/jpeg', 0.85);
            this.videoPosters.set(url, posterData);
          }
        } catch {
          // Canvas capture might fail if codec is unsupported or tainted, that's okay
        }

        settled = true;
        clearTimeout(timeout);
        cleanup();
        resolve(true);
      };

      video.onerror = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          cleanup();
          resolve(true); // Fallback gracefully
        }
      };

      video.src = url;
    });
  }
}

export const assetPreloader = new AssetPreloader();
