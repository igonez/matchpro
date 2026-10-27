// Renderiza o vídeo completo do ArenaFitPro em 1080x1920 Full HD + Capa para Reels
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const videoDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(videoDir, '..');

console.log('1/4 Bundling composition...');
const serveUrl = await bundle({
  entryPoint: path.join(videoDir, 'src/index.ts'),
  publicDir: path.join(videoDir, 'public'),
});

console.log('2/4 Selecting ArenaSpot composition (1080x1920 @ 30fps)...');
const composition = await selectComposition({ serveUrl, id: 'ArenaSpot' });

const outCover = path.join(videoDir, 'out/capa-reels-1080x1920.jpg');
const outVideo = path.join(videoDir, 'out/arenafitpro-spot.mp4');

const coverFrame = composition.durationInFrames - 25;
console.log(`3/4 Rendering Reels cover image (frame ${coverFrame})...`);
await renderStill({
  composition,
  serveUrl,
  frame: coverFrame,
  output: outCover,
  imageFormat: 'jpeg',
  jpegQuality: 95,
  scale: 1,
});

console.log(`4/4 Rendering Full HD 1080x1920 video with ElevenLabs audio (${composition.durationInFrames} frames)...`);
await renderMedia({
  composition,
  serveUrl,
  codec: 'h264',
  outputLocation: outVideo,
  scale: 1,
  crf: 18,
  pixelFormat: 'yuv420p',
  onProgress: ({ progress }) => {
    if (Math.round(progress * 100) % 25 === 0) {
      process.stdout.write(`\rProgress: ${Math.round(progress * 100)}%`);
    }
  },
});

// Copia para public/ e para a pasta do Instagram Reels
const publicMp4 = path.join(rootDir, 'public/arenafitpro-spot.mp4');
const reelsDir = path.join(rootDir, 'public/social/Postagens Instagram/Reels Spot 3D');
fs.mkdirSync(reelsDir, { recursive: true });
const reelsMp4 = path.join(reelsDir, 'reels-arenafitpro-spot-3d.mp4');
const reelsCover = path.join(reelsDir, 'capa-reels.jpg');

fs.copyFileSync(outVideo, publicMp4);
fs.copyFileSync(outVideo, reelsMp4);
fs.copyFileSync(outCover, reelsCover);

console.log('\nDone! Saved Full HD video with audio to:');
console.log(' -', publicMp4);
console.log(' -', reelsMp4);
