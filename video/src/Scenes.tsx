import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ArenaBackground, C, Caption, ChromeStar3D, FONT, GlassChip, MONO, Phone3D, chromeText, clamp } from './components/Arena3D';

// ---------------------------------------------------------------------------
// CENA 1 — HOOK: estrela cromada 3D atravessa a tela + tipografia cinética
// ---------------------------------------------------------------------------
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const starIn = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const starRot = interpolate(frame, [0, 75], [-200, 30], { easing: Easing.out(Easing.cubic), ...clamp });
  const starZ = interpolate(starIn, [0, 1], [-1400, -200]);

  const line1 = spring({ frame: frame - 4, fps, config: { damping: 20, stiffness: 200 } });
  const line2 = spring({ frame: frame - 12, fps, config: { damping: 20, stiffness: 200 } });
  const strike = interpolate(frame, [42, 52], [0, 100], clamp);
  const slam = spring({ frame: frame - 54, fps, config: { damping: 9, stiffness: 180 } });
  const shake = frame >= 54 && frame < 62 ? Math.sin(frame * 3) * (62 - frame) * 2 : 0;

  return (
    <AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
      <ArenaBackground />
      <AbsoluteFill style={{ perspective: 1200, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `translate3d(0, -420px, ${starZ}px)`, opacity: starIn * 0.55, transformStyle: 'preserve-3d' }}>
          <ChromeStar3D size={520} rotateY={starRot} rotateX={12} glow={0.6} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily: FONT, textAlign: 'center' }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 30,
            letterSpacing: 8,
            color: C.zinc,
            padding: '12px 28px',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: 999,
            marginBottom: 40,
            opacity: line1,
          }}
        >
          PERSONAL • NUTRI • ACADEMIA
        </div>
        <div
          style={{
            fontSize: 118,
            fontWeight: 900,
            letterSpacing: -4,
            lineHeight: 1,
            transform: `translateX(${(1 - line1) * -400}px)`,
            opacity: line1,
            ...chromeText(8),
          }}
        >
          DESAFIO NO
        </div>
        <div style={{ position: 'relative', marginTop: 10, transform: `translateX(${(1 - line2) * 400}px)`, opacity: line2 }}>
          <span style={{ fontSize: 132, fontWeight: 900, letterSpacing: -5, color: C.red }}>WHATSAPP?</span>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '52%',
              height: 14,
              width: `${strike}%`,
              background: C.white,
              borderRadius: 8,
              boxShadow: '0 0 30px rgba(255,255,255,0.8)',
            }}
          />
        </div>
        <div
          style={{
            marginTop: 50,
            fontSize: 96,
            fontWeight: 900,
            color: '#000',
            background: C.white,
            padding: '6px 40px',
            borderRadius: 20,
            transform: `scale(${interpolate(slam, [0, 1], [3, 1])}) rotate(-3deg)`,
            opacity: interpolate(frame, [54, 58], [0, 1], clamp),
            boxShadow: '0 30px 80px rgba(255,255,255,0.25)',
          }}
        >
          ACABOU.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// CENA 2 — LOGO REVEAL: ícone oficial girando em 3D + light sweep
// ---------------------------------------------------------------------------
export const SceneLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 13, stiffness: 90 } });
  const rotY = interpolate(enter, [0, 1], [-110, 0]) + Math.sin(frame / 18) * 8;
  const rotX = interpolate(enter, [0, 1], [40, 8]);
  const sweep = interpolate(frame, [18, 48], [-60, 160], clamp);
  const title = spring({ frame: frame - 22, fps, config: { damping: 200 } });
  const sub = spring({ frame: frame - 34, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill>
      <ArenaBackground glow="rgba(255,255,255,0.16)" />
      <AbsoluteFill style={{ perspective: 1400, alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            position: 'relative',
            width: 460,
            height: 460,
            marginTop: -260,
            transformStyle: 'preserve-3d',
            transform: `scale(${0.4 + enter * 0.6}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
          {/* Espessura do ícone */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 110,
                background: `rgb(${40 - i * 2},${40 - i * 2},${44 - i * 2})`,
                transform: `translateZ(${-i * 3}px)`,
              }}
            />
          ))}
          <Img
            src={staticFile('logo.png')}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 110, transform: 'translateZ(1px)' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 110,
              overflow: 'hidden',
              transform: 'translateZ(2px)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-20%',
                bottom: '-20%',
                width: '35%',
                left: `${sweep}%`,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
                transform: 'skewX(-20deg)',
              }}
            />
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', fontFamily: FONT, paddingTop: 520 }}>
        <div style={{ fontSize: 138, fontWeight: 900, letterSpacing: -5, opacity: title, transform: `translateY(${(1 - title) * 60}px)` }}>
          <span style={chromeText(10)}>ArenaFit</span>
          <span style={{ color: C.zinc, fontWeight: 300 }}>Pro</span>
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: MONO,
            fontSize: 34,
            letterSpacing: 10,
            color: C.zinc,
            opacity: sub,
          }}
        >
          GAMIFICATION OS
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// CENA 3 — CÂMERA ANTIFRAUDE (tela real) com chips flutuando em profundidade
// ---------------------------------------------------------------------------
export const SceneCamera: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  const rotY = interpolate(enter, [0, 1], [-65, -18]) + interpolate(frame, [0, 120], [0, 10]);
  const rotX = interpolate(enter, [0, 1], [25, 8]);
  const scan = interpolate(frame % 50, [0, 50], [22, 46]);

  const chip = (delay: number) => spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 140 } });
  const c1 = chip(22);
  const c2 = chip(34);
  const c3 = chip(46);
  const float = (o: number) => Math.sin((frame + o) / 14) * 12;

  return (
    <AbsoluteFill>
      <ArenaBackground glow="rgba(52,211,153,0.16)" />
      <AbsoluteFill style={{ perspective: 1600 }}>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: 'translateY(-120px)' }}>
          <Phone3D src="tela-camera.jpg" width={560} rotateY={rotY} rotateX={rotX} rotateZ={2} shine={interpolate(frame, [0, 120], [0.1, 0.9])}>
            {/* Laser de scanner sobre a tela real */}
            <div
              style={{
                position: 'absolute',
                left: '8%',
                right: '8%',
                top: `${scan}%`,
                height: 6,
                background: 'linear-gradient(90deg, transparent, #34d399, transparent)',
                boxShadow: '0 0 30px 10px rgba(52,211,153,0.5)',
              }}
            />
          </Phone3D>

          <GlassChip
            accent="rgba(248,113,113,0.75)"
            style={{ left: 95, top: 440, opacity: c1, transform: `translate3d(${(1 - c1) * -160}px, ${float(0)}px, 180px) rotateY(14deg) scale(0.75)` }}
          >
            <div style={{ fontFamily: MONO, fontSize: 18, color: C.red, letterSpacing: 3 }}>⛔ GALERIA</div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>BLOQUEADA</div>
          </GlassChip>

          <GlassChip
            accent="rgba(52,211,153,0.75)"
            style={{ right: 90, top: 760, opacity: c2, transform: `translate3d(${(1 - c2) * 160}px, ${float(20)}px, 200px) rotateY(-12deg) scale(0.75)` }}
          >
            <div style={{ fontFamily: MONO, fontSize: 18, color: C.emerald, letterSpacing: 3 }}>IA NUTRICIONAL</div>
            <div style={{ fontSize: 36, fontWeight: 900 }}>580 KCAL ✓</div>
          </GlassChip>

          <GlassChip
            accent="rgba(250,204,21,0.75)"
            style={{ left: 100, top: 1100, opacity: c3, transform: `translate3d(${(1 - c3) * -160}px, ${float(40)}px, 190px) rotateY(12deg) scale(0.75)` }}
          >
            <div style={{ fontFamily: MONO, fontSize: 18, color: C.zinc, letterSpacing: 2 }}>TIMESTAMP 12:45:19</div>
            <div style={{ fontSize: 38, fontWeight: 900, color: C.gold }}>+15 XP</div>
          </GlassChip>
        </div>
      </AbsoluteFill>
      <Caption text="Câmera antifraude ao vivo" highlight="antifraude" start={10} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// CENA 4 — LEADERBOARD (tela real) com medalhas 3D saltando da tela
// ---------------------------------------------------------------------------
const Medal3D: React.FC<{ color: string; label: string; rot: number }> = ({ color, label, rot }) => (
  <div style={{ width: 170, height: 170, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${rot}deg)` }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: i === 7 || i === 0 ? `radial-gradient(circle at 35% 30%, #fff, ${color} 45%, #000 120%)` : color,
          filter: i === 7 || i === 0 ? undefined : 'brightness(0.55)',
          transform: `translateZ(${(i - 4) * 3}px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 64,
          color: '#111',
        }}
      >
        {i === 7 ? label : ''}
      </div>
    ))}
  </div>
);

export const SceneLeaderboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  const rotY = interpolate(enter, [0, 1], [60, 16]) - interpolate(frame, [0, 120], [0, 8]);
  const medal = (d: number) => spring({ frame: frame - d, fps, config: { damping: 10, stiffness: 120 } });
  const m1 = medal(20);
  const m2 = medal(28);
  const m3 = medal(36);
  const xp = Math.round(interpolate(frame, [40, 90], [1820, 1865], { easing: Easing.out(Easing.cubic), ...clamp }));
  const overtake = spring({ frame: frame - 90, fps, config: { damping: 10 } });

  return (
    <AbsoluteFill>
      <ArenaBackground glow="rgba(250,204,21,0.16)" />
      <AbsoluteFill style={{ perspective: 1600 }}>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: 'translateY(-120px)' }}>
          <Phone3D src="tela-leaderboard.jpg" width={560} rotateY={rotY} rotateX={8} rotateZ={-2} shine={interpolate(frame, [0, 120], [0.9, 0.1])} />

          <div style={{ position: 'absolute', left: 95, top: 340, transformStyle: 'preserve-3d', transform: `translate3d(0, ${(1 - m1) * 400}px, 260px) scale(${m1 * 0.85})` }}>
            <Medal3D color={C.gold} label="1º" rot={Math.sin(frame / 10) * 28} />
          </div>
          <div style={{ position: 'absolute', right: 85, top: 560, transformStyle: 'preserve-3d', transform: `translate3d(0, ${(1 - m2) * 400}px, 220px) scale(${m2 * 0.72})` }}>
            <Medal3D color="#d4d4d8" label="2º" rot={Math.cos(frame / 11) * 26} />
          </div>
          <div style={{ position: 'absolute', left: 100, top: 1120, transformStyle: 'preserve-3d', transform: `translate3d(0, ${(1 - m3) * 400}px, 210px) scale(${m3 * 0.68})` }}>
            <Medal3D color={C.bronze} label="3º" rot={Math.sin((frame + 20) / 10) * 25} />
          </div>

          <GlassChip
            accent="rgba(250,204,21,0.75)"
            style={{ right: 95, top: 1020, opacity: m2, transform: `translate3d(0, ${Math.sin(frame / 12) * 10}px, 190px) rotateY(-12deg) scale(${0.75 + overtake * 0.05})` }}
          >
            <div style={{ fontFamily: MONO, fontSize: 18, color: C.zinc, letterSpacing: 2 }}>GABRIEL • XP TOTAL</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: C.gold }}>{xp.toLocaleString('pt-BR')}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.emerald, opacity: overtake }}>▲ PASSOU PARA #03</div>
          </GlassChip>
        </div>
      </AbsoluteFill>
      <Caption text="Ranking ao vivo que vicia a turma" highlight="vicia" start={10} color={C.gold} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// CENA 5 — CENTRAL FINANCEIRA (tela real) + contador e moedas Pix 3D
// ---------------------------------------------------------------------------
const Coin: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const t = (frame - 15 - i * 6) / 60;
  if (t < 0 || t > 1.4) return null;
  const x = Math.sin(i * 2.1) * 360;
  const y = interpolate(t, [0, 1], [-800, 480]);
  const z = 180 + (i % 3) * 90;
  const sway = Math.sin((frame + i * 14) / 8) * 32;
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 105,
        height: 105,
        marginLeft: -52,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #d1fae5, #34d399 45%, #065f46 110%)',
        border: '5px solid #10b981',
        boxShadow: '0 0 36px rgba(52,211,153,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 36,
        color: '#022c22',
        transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${sway}deg) rotateX(18deg)`,
      }}
    >
      R$
    </div>
  );
};

export const SceneFinance: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  const tilt = interpolate(enter, [0, 1], [70, 20]);
  const value = interpolate(frame, [20, 85], [0, 4750], { easing: Easing.out(Easing.exp), ...clamp });
  const big = spring({ frame: frame - 14, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill>
      <ArenaBackground glow="rgba(52,211,153,0.18)" />
      <AbsoluteFill style={{ perspective: 1600 }}>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: 'translateY(40px)' }}>
          <Phone3D src="tela-financeiro.jpg" width={540} rotateX={tilt} rotateY={-6} rotateZ={interpolate(frame, [0, 120], [-4, 4])} y={120} />
          {Array.from({ length: 9 }).map((_, i) => (
            <Coin key={i} i={i} />
          ))}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', fontFamily: FONT, paddingTop: 200 }}>
        <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 6, color: C.emerald, opacity: big }}>⚡ SPLIT PIX D+0 • ASAAS</div>
        <div
          style={{
            fontSize: 150,
            fontWeight: 900,
            letterSpacing: -6,
            marginTop: 10,
            transform: `scale(${0.6 + big * 0.4}) perspective(800px) rotateX(12deg)`,
            ...chromeText(12, '#064e3b'),
          }}
        >
          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 40, fontWeight: 800, color: C.zinc, opacity: big }}>
          na sua conta. <span style={{ color: C.emerald }}>0% de taxa</span> no PRO.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// CENA 6 — CARROSSEL 3D com as 3 telas reais + CTA final
// ---------------------------------------------------------------------------
export const SceneFinal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 80 } });
  const sway = interpolate(frame, [0, 120], [-8, 8], { easing: Easing.inOut(Easing.sin) });
  const cta = spring({ frame: frame - 32, fps, config: { damping: 11, stiffness: 140 } });
  const pulse = 1 + Math.sin(frame / 5) * 0.025 * cta;

  return (
    <AbsoluteFill>
      <ArenaBackground glow="rgba(255,255,255,0.16)" />
      <AbsoluteFill style={{ perspective: 1800, perspectiveOrigin: '50% 38%' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            transform: `translate3d(0, -230px, ${(1 - enter) * -600}px) rotateY(${sway}deg)`,
          }}
        >
          {/* Esquerda: Câmera Antifraude */}
          <Phone3D
            src="tela-camera.jpg"
            width={340}
            x={-260 * enter}
            y={30}
            translateZ={-120}
            rotateY={26}
            rotateZ={-4}
            shine={interpolate(frame, [0, 120], [0.2, 0.8])}
          />
          {/* Direita: Financeiro Split Pix */}
          <Phone3D
            src="tela-financeiro.jpg"
            width={340}
            x={260 * enter}
            y={30}
            translateZ={-120}
            rotateY={-26}
            rotateZ={4}
            shine={interpolate(frame, [0, 120], [0.8, 0.2])}
          />
          {/* Centro (Frente): Leaderboard */}
          <Phone3D
            src="tela-leaderboard.jpg"
            width={400}
            x={0}
            y={-20}
            translateZ={90}
            rotateX={4}
            shine={interpolate(frame, [0, 120], [0.1, 0.9])}
          />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 210, fontFamily: FONT }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: enter, marginBottom: 36 }}>
          <Img src={staticFile('logo.png')} style={{ width: 96, height: 96, borderRadius: 24 }} />
          <div style={{ fontSize: 76, fontWeight: 900, letterSpacing: -3 }}>
            <span style={chromeText(6)}>ArenaFit</span>
            <span style={{ color: C.zinc, fontWeight: 300 }}>Pro</span>
          </div>
        </div>
        <div
          style={{
            padding: '32px 66px',
            borderRadius: 999,
            background: C.white,
            color: '#000',
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: 1,
            transform: `translateY(${(1 - cta) * 200}px) scale(${pulse})`,
            opacity: cta,
            boxShadow: '0 25px 70px rgba(255,255,255,0.3), inset 0 -4px 8px rgba(0,0,0,0.3)',
          }}
        >
          CRIE SEU DESAFIO →
        </div>
        <div style={{ marginTop: 26, fontFamily: MONO, fontSize: 32, color: C.zinc, letterSpacing: 4, opacity: cta }}>
          arenafitpro.com.br
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
