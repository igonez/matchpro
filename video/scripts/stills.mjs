// Renderiza frames de pré-visualização (1 bundle, vários stills)
// Uso: node scripts/stills.mjs 55 110 200 ...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';

const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const composition = await selectComposition({ serveUrl, id: 'ArenaSpot' });

for (const frame of frames) {
  await renderStill({ composition, serveUrl, frame, output: `out/f${frame}.png`, scale: 0.4 });
  console.log(`ok frame ${frame}`);
}
