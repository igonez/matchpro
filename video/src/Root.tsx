import React from 'react';
import { AbsoluteFill, Audio, Composition, Sequence, staticFile } from 'remotion';
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { flip } from '@remotion/transitions/flip';
import { SceneCamera, SceneFinal, SceneFinance, SceneHook, SceneLeaderboard, SceneLogo } from './Scenes';

const FPS = 30;
const T = 12; // frames de cada transição (0.4s)

// Sincronizado quadro a quadro com o áudio enviado pelo usuário (vo-full.mp3 — ~23.3s):
// 00:00 - 00:03.1 -> Cena 1 (Hook): "Desafio fitness no WhatsApp? Acabou." (start 0f, end 100f)
// 00:03.1 - 00:05.3 -> Cena 2 (Logo): "Conheça a Arena Fit Pro." (start 88f, end 166f)
// 00:05.3 - 00:09.9 -> Cena 3 (Câmera): "Câmera antifraude ao vivo com IA nutricional e galeria bloqueada." (start 154f, end 304f)
// 00:09.9 - 00:13.2 -> Cena 4 (Leaderboard): "Ranking em tempo real que vicia a turma inteira." (start 292f, end 402f)
// 00:13.2 - 00:18.1 -> Cena 5 (Financeiro): "E Split Pix D+0 direto na sua conta com 0% de taxa." (start 390f, end 548f)
// 00:18.1 - 00:23.8 -> Cena 6 (Final CTA): "Crie seu desafio agora em arenafitpro.com.br." (start 536f, end 716f)
const SCENES = [100, 78, 150, 110, 158, 180];
const TOTAL = SCENES.reduce((a, b) => a + b, 0) - T * (SCENES.length - 1); // 716 frames (~23.86s)

const SCENE_STARTS = SCENES.reduce<number[]>((acc, _, idx) => {
  if (idx === 0) return [0];
  const prevStart = acc[idx - 1];
  return [...acc, prevStart + SCENES[idx - 1] - T];
}, []);

export const ArenaSpot: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#000' }}>
    {/* Faixa principal com a voz enviada pelo usuário */}
    <Audio src={staticFile('vo-full.mp3')} volume={1} />

    {/* Efeitos sonoros sutis nas transições */}
    <Sequence from={SCENE_STARTS[1]}>
      <Audio src={staticFile('sfx-impact.mp3')} volume={0.32} />
    </Sequence>
    {[SCENE_STARTS[2], SCENE_STARTS[3], SCENE_STARTS[4], SCENE_STARTS[5]].map((startFrame, i) => (
      <Sequence key={`sfx-${i}`} from={Math.max(0, startFrame - 4)}>
        <Audio src={staticFile('sfx-whoosh.mp3')} volume={0.25} />
      </Sequence>
    ))}

    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENES[0]}>
        <SceneHook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

      <TransitionSeries.Sequence durationInFrames={SCENES[1]}>
        <SceneLogo />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: 'from-bottom' })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

      <TransitionSeries.Sequence durationInFrames={SCENES[2]}>
        <SceneCamera />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={flip({ direction: 'from-right' })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

      <TransitionSeries.Sequence durationInFrames={SCENES[3]}>
        <SceneLeaderboard />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: 'from-right' })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />

      <TransitionSeries.Sequence durationInFrames={SCENES[4]}>
        <SceneFinance />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

      <TransitionSeries.Sequence durationInFrames={SCENES[5]}>
        <SceneFinal />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition id="ArenaSpot" component={ArenaSpot} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
);
