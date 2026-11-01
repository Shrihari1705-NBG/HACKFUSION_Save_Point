// Procedural Minecraft-authentic pixel textures generated as crisp SVG data-URIs
// Zero external image dependencies, instant loading, pixel-perfect rendering

// Helper to encode SVG for CSS background-image
function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 16x16 Authentic Minecraft Dirt Texture
function generateDirtSvg(): string {
  // 16x16 palette of authentic dirt pixels
  const c = {
    d1: '#47311d', // very dark brown
    d2: '#573d26', // dark brown
    d3: '#6a4a2f', // mid-dark brown
    d4: '#79553a', // classic dirt base
    d5: '#866043', // lighter dirt speckle
    d6: '#936a4c', // highlight speckle
  };

  const grid = [
    [c.d4, c.d4, c.d3, c.d4, c.d2, c.d3, c.d4, c.d5, c.d4, c.d3, c.d4, c.d4, c.d2, c.d3, c.d4, c.d4],
    [c.d3, c.d5, c.d4, c.d2, c.d4, c.d4, c.d3, c.d4, c.d2, c.d5, c.d6, c.d3, c.d4, c.d4, c.d5, c.d3],
    [c.d4, c.d4, c.d2, c.d4, c.d5, c.d3, c.d4, c.d2, c.d4, c.d4, c.d4, c.d2, c.d5, c.d4, c.d3, c.d4],
    [c.d2, c.d3, c.d4, c.d4, c.d4, c.d2, c.d5, c.d4, c.d3, c.d2, c.d3, c.d4, c.d4, c.d2, c.d4, c.d5],
    [c.d4, c.d4, c.d5, c.d3, c.d2, c.d4, c.d4, c.d3, c.d4, c.d5, c.d4, c.d4, c.d3, c.d4, c.d4, c.d2],
    [c.d5, c.d2, c.d4, c.d4, c.d4, c.d5, c.d3, c.d4, c.d2, c.d4, c.d3, c.d5, c.d4, c.d2, c.d5, c.d4],
    [c.d4, c.d4, c.d3, c.d2, c.d4, c.d4, c.d2, c.d5, c.d4, c.d3, c.d4, c.d4, c.d2, c.d4, c.d4, c.d3],
    [c.d3, c.d5, c.d4, c.d4, c.d5, c.d3, c.d4, c.d4, c.d3, c.d4, c.d5, c.d3, c.d4, c.d5, c.d3, c.d4],
    [c.d4, c.d4, c.d2, c.d5, c.d4, c.d2, c.d4, c.d3, c.d4, c.d2, c.d4, c.d4, c.d4, c.d2, c.d4, c.d5],
    [c.d2, c.d3, c.d4, c.d4, c.d3, c.d4, c.d5, c.d4, c.d2, c.d4, c.d5, c.d3, c.d2, c.d4, c.d4, c.d3],
    [c.d4, c.d5, c.d3, c.d2, c.d4, c.d4, c.d3, c.d2, c.d4, c.d5, c.d4, c.d4, c.d4, c.d5, c.d3, c.d4],
    [c.d3, c.d4, c.d4, c.d4, c.d5, c.d3, c.d4, c.d4, c.d5, c.d3, c.d2, c.d5, c.d3, c.d4, c.d4, c.d2],
    [c.d4, c.d2, c.d5, c.d3, c.d4, c.d4, c.d2, c.d5, c.d4, c.d4, c.d4, c.d3, c.d4, c.d2, c.d5, c.d4],
    [c.d5, c.d4, c.d4, c.d4, c.d2, c.d5, c.d4, c.d3, c.d2, c.d4, c.d5, c.d4, c.d2, c.d4, c.d4, c.d3],
    [c.d4, c.d3, c.d2, c.d5, c.d4, c.d4, c.d3, c.d4, c.d4, c.d3, c.d4, c.d2, c.d4, c.d5, c.d3, c.d4],
    [c.d3, c.d4, c.d4, c.d4, c.d3, c.d2, c.d4, c.d5, c.d3, c.d4, c.d4, c.d4, c.d5, c.d4, c.d2, c.d4],
  ];

  let rects = '';
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${grid[y][x]}"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges">${rects}</svg>`;
}

// 16x16 Minecraft Stone Texture
function generateStoneSvg(): string {
  const c = {
    s1: '#4a4a4a', // dark stone
    s2: '#5c5c5c', // mid-dark
    s3: '#6e6e6e', // stone base
    s4: '#7f7f7f', // lighter speckle
    s5: '#919191', // highlight
  };

  const grid = [
    [c.s3, c.s3, c.s2, c.s3, c.s4, c.s3, c.s2, c.s3, c.s3, c.s4, c.s3, c.s2, c.s3, c.s4, c.s3, c.s3],
    [c.s2, c.s4, c.s3, c.s1, c.s3, c.s5, c.s3, c.s4, c.s2, c.s3, c.s4, c.s3, c.s1, c.s3, c.s5, c.s2],
    [c.s3, c.s3, c.s4, c.s3, c.s2, c.s3, c.s4, c.s2, c.s3, c.s3, c.s2, c.s4, c.s3, c.s2, c.s3, c.s4],
    [c.s4, c.s2, c.s3, c.s5, c.s3, c.s2, c.s3, c.s3, c.s4, c.s2, c.s3, c.s3, c.s4, c.s3, c.s2, c.s3],
    [c.s3, c.s3, c.s2, c.s3, c.s4, c.s3, c.s2, c.s4, c.s3, c.s3, c.s5, c.s3, c.s2, c.s3, c.s4, c.s3],
    [c.s2, c.s5, c.s3, c.s3, c.s1, c.s4, c.s3, c.s3, c.s2, c.s4, c.s3, c.s2, c.s3, c.s5, c.s3, c.s2],
    [c.s4, c.s3, c.s2, c.s4, c.s3, c.s2, c.s4, c.s2, c.s3, c.s3, c.s3, c.s4, c.s2, c.s3, c.s3, c.s4],
    [c.s3, c.s2, c.s4, c.s3, c.s3, c.s4, c.s3, c.s3, c.s4, c.s2, c.s3, c.s3, c.s4, c.s2, c.s4, c.s3],
    [c.s3, c.s4, c.s3, c.s2, c.s4, c.s3, c.s2, c.s3, c.s3, c.s4, c.s3, c.s2, c.s3, c.s4, c.s3, c.s3],
    [c.s2, c.s3, c.s5, c.s3, c.s2, c.s3, c.s4, c.s2, c.s5, c.s3, c.s3, c.s4, c.s2, c.s3, c.s5, c.s2],
    [c.s4, c.s2, c.s3, c.s4, c.s3, c.s2, c.s3, c.s4, c.s3, c.s2, c.s4, c.s3, c.s3, c.s2, c.s3, c.s4],
    [c.s3, c.s4, c.s2, c.s3, c.s5, c.s3, c.s2, c.s3, c.s4, c.s3, c.s2, c.s5, c.s3, c.s4, c.s2, c.s3],
    [c.s2, c.s3, c.s4, c.s2, c.s3, c.s4, c.s3, c.s2, c.s3, c.s4, c.s3, c.s2, c.s4, c.s3, c.s3, c.s2],
    [c.s3, c.s5, c.s3, c.s3, c.s2, c.s3, c.s5, c.s3, c.s2, c.s3, c.s4, c.s3, c.s2, c.s5, c.s3, c.s3],
    [c.s4, c.s3, c.s2, c.s4, c.s3, c.s2, c.s3, c.s4, c.s3, c.s2, c.s3, c.s4, c.s3, c.s2, c.s4, c.s3],
    [c.s3, c.s2, c.s4, c.s3, c.s4, c.s3, c.s2, c.s3, c.s4, c.s3, c.s2, c.s3, c.s4, c.s3, c.s2, c.s4],
  ];

  let rects = '';
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${grid[y][x]}"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges">${rects}</svg>`;
}

// 16x16 Dark Bedrock / Obsidian Texture for modals & deep UI frames
function generateBedrockSvg(): string {
  const c = {
    b1: '#111111',
    b2: '#222222',
    b3: '#333333',
    b4: '#444444',
    b5: '#555555',
  };

  const grid = [
    [c.b1, c.b2, c.b3, c.b1, c.b2, c.b4, c.b2, c.b1, c.b3, c.b2, c.b1, c.b4, c.b2, c.b1, c.b3, c.b2],
    [c.b2, c.b4, c.b1, c.b3, c.b1, c.b2, c.b3, c.b2, c.b1, c.b4, c.b2, c.b1, c.b3, c.b2, c.b1, c.b4],
    [c.b3, c.b1, c.b5, c.b2, c.b4, c.b1, c.b2, c.b4, c.b2, c.b1, c.b5, c.b2, c.b1, c.b4, c.b2, c.b1],
    [c.b1, c.b3, c.b2, c.b1, c.b2, c.b3, c.b1, c.b2, c.b3, c.b2, c.b1, c.b3, c.b2, c.b1, c.b3, c.b2],
    [c.b2, c.b1, c.b4, c.b3, c.b1, c.b2, c.b4, c.b1, c.b2, c.b4, c.b1, c.b2, c.b4, c.b3, c.b1, c.b2],
    [c.b4, c.b2, c.b1, c.b2, c.b3, c.b1, c.b2, c.b3, c.b1, c.b2, c.b3, c.b1, c.b2, c.b1, c.b2, c.b3],
    [c.b1, c.b3, c.b2, c.b4, c.b1, c.b5, c.b2, c.b1, c.b4, c.b1, c.b2, c.b4, c.b1, c.b3, c.b2, c.b1],
    [c.b3, c.b1, c.b2, c.b1, c.b3, c.b2, c.b1, c.b4, c.b2, c.b3, c.b1, c.b2, c.b3, c.b1, c.b4, c.b2],
    [c.b2, c.b4, c.b1, c.b3, c.b2, c.b1, c.b3, c.b2, c.b1, c.b2, c.b4, c.b1, c.b2, c.b3, c.b2, c.b1],
    [c.b1, c.b2, c.b3, c.b2, c.b1, c.b4, c.b2, c.b1, c.b3, c.b1, c.b2, c.b3, c.b1, c.b2, c.b1, c.b4],
    [c.b3, c.b1, c.b2, c.b4, c.b2, c.b1, c.b5, c.b3, c.b2, c.b4, c.b1, c.b2, c.b4, c.b1, c.b3, c.b2],
    [c.b2, c.b3, c.b1, c.b2, c.b3, c.b2, c.b1, c.b2, c.b1, c.b2, c.b3, c.b1, c.b2, c.b3, c.b2, c.b1],
    [c.b1, c.b4, c.b2, c.b1, c.b2, c.b4, c.b2, c.b1, c.b3, c.b1, c.b2, c.b4, c.b1, c.b2, c.b4, c.b2],
    [c.b4, c.b1, c.b3, c.b2, c.b1, c.b2, c.b3, c.b4, c.b2, c.b3, c.b1, c.b2, c.b3, c.b1, c.b2, c.b3],
    [c.b2, c.b3, c.b1, c.b4, c.b2, c.b1, c.b2, c.b1, c.b4, c.b2, c.b3, c.b1, c.b2, c.b4, c.b1, c.b2],
    [c.b1, c.b2, c.b4, c.b2, c.b3, c.b2, c.b1, c.b3, c.b2, c.b1, c.b2, c.b3, c.b1, c.b2, c.b3, c.b1],
  ];

  let rects = '';
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${grid[y][x]}"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges">${rects}</svg>`;
}

export const DIRT_TEXTURE_URI = svgToDataUri(generateDirtSvg());
export const STONE_TEXTURE_URI = svgToDataUri(generateStoneSvg());
export const BEDROCK_TEXTURE_URI = svgToDataUri(generateBedrockSvg());

