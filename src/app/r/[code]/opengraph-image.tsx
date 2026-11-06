import { ImageResponse } from 'next/og';
import { formatRankOfTotal } from '@/lib/share/ranking-format';
import { getPublicShareByCode } from '@/lib/share/ranking-share.server';

export const alt = 'Ranking Oficial • ArenaFitPro';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const result = await getPublicShareByCode(code);

  if (result.status !== 'ok' || !result.record) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#080A0F',
            color: '#ffffff',
            padding: '60px',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              padding: '10px 24px',
              borderRadius: '999px',
              backgroundColor: 'rgba(251,191,36,0.15)',
              color: '#fde047',
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 24,
            }}
          >
            ARENAFITPRO • RANKING OFICIAL
          </div>
          <div style={{ fontSize: 54, fontWeight: 900, textAlign: 'center' }}>
            Desafios Fitness Gamificados
          </div>
          <div style={{ fontSize: 26, color: '#a1a1aa', marginTop: 18 }}>
            arenafitpro.com.br
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const { snapshot } = result.record;
  const sharer = snapshot.sharer;
  const top3 = (snapshot.top || []).slice(0, 3);
  const rankBadge = sharer
    ? formatRankOfTotal(sharer.rank, snapshot.totalParticipants)
    : `${snapshot.totalParticipants} atletas`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#080A0F',
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(251, 191, 36, 0.22), transparent 55%), radial-gradient(circle at 85% 80%, rgba(52, 120, 246, 0.22), transparent 50%)',
          color: '#ffffff',
          padding: '52px 64px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '10px 22px',
              borderRadius: '999px',
              backgroundColor: 'rgba(251, 191, 36, 0.16)',
              border: '2px solid rgba(251, 191, 36, 0.45)',
              color: '#fde047',
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            <span>🏆 RANKING OFICIAL • ARENAFITPRO</span>
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 22,
              fontWeight: 700,
              color: '#a1a1aa',
            }}
          >
            {snapshot.totalParticipants} participantes
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '40px',
            width: '100%',
          }}
        >
          {/* Left: Challenge Title + Sharer Highlight */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              maxWidth: '620px',
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 900,
                lineHeight: 1.12,
                color: '#ffffff',
                marginBottom: '24px',
              }}
            >
              {snapshot.challengeTitle}
            </div>

            {sharer && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '22px 28px',
                  borderRadius: '24px',
                  backgroundColor: 'rgba(24, 24, 27, 0.92)',
                  border: '2px solid rgba(251, 191, 36, 0.5)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 20, color: '#fde047', fontWeight: 800 }}>
                    {sharer.name} • {rankBadge}
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>
                    {sharer.points} XP
                  </div>
                </div>

                {sharer.percentile !== null && (
                  <div
                    style={{
                      display: 'flex',
                      padding: '10px 20px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(52, 120, 246, 0.18)',
                      border: '2px solid rgba(117, 167, 255, 0.5)',
                      color: '#75A7FF',
                      fontSize: 24,
                      fontWeight: 900,
                    }}
                  >
                    Top {sharer.percentile}%
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Top 3 Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '410px',
              padding: '24px',
              borderRadius: '28px',
              backgroundColor: 'rgba(18, 18, 22, 0.95)',
              border: '2px solid rgba(255, 255, 255, 0.14)',
              gap: '14px',
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24', letterSpacing: '1px' }}>
              PÓDIO TOP 3
            </div>
            {top3.map((item) => (
              <div
                key={item.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  backgroundColor:
                    item.rank === 1 ? 'rgba(251, 191, 36, 0.14)' : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 22,
                      fontWeight: 900,
                      color:
                        item.rank === 1
                          ? '#fde047'
                          : item.rank === 2
                          ? '#e2e8f0'
                          : '#fb923c',
                    }}
                  >
                    #{item.rank}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>
                    {item.name}
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fde047' }}>
                  {item.points} XP
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: '18px',
            fontSize: 20,
            color: '#a1a1aa',
          }}
        >
          <span>Classificação auditada por câmera antifraude e IA</span>
          <span style={{ color: '#ffffff', fontWeight: 800 }}>arenafitpro.com.br</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
