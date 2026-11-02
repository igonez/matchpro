'use client';

import React, { forwardRef } from 'react';
import {
  computeTopPercentile,
  formatCardDisplayName,
  formatRankOfTotal,
  getInitials,
  truncateWithEllipsis,
} from '@/lib/share/ranking-format';

export interface ShareParticipantItem {
  studentId: string;
  name: string;
  avatarUrl?: string | null;
  points: number;
  streakDays?: number;
}

export type RankingCardVariant = 'podium' | 'list';
export type RankingBgMode = 'transparent' | 'gallery' | 'camera';

export interface RankingShareCardProps {
  variant: RankingCardVariant;
  challengeTitle: string;
  challengeLogoUrl?: string | null;
  standings: ShareParticipantItem[];
  currentUserId?: string | null;
  isCoachView?: boolean;
  backgroundMode: RankingBgMode;
  backgroundPhotoUrl?: string | null;
  /** Mapa de URL original -> dataURL pré-carregada para captura determinística */
  preloadedImages?: Record<string, string>;
}

const TEXT_SHADOW_STRONG = '0 2px 10px rgba(0, 0, 0, 0.78), 0 1px 3px rgba(0, 0, 0, 0.9)';
const TEXT_SHADOW_SOFT = '0 2px 6px rgba(0, 0, 0, 0.65)';

export const RankingShareCard = forwardRef<HTMLDivElement, RankingShareCardProps>(
  function RankingShareCard(
    {
      variant,
      challengeTitle,
      challengeLogoUrl,
      standings,
      currentUserId,
      isCoachView = false,
      backgroundMode,
      backgroundPhotoUrl,
      preloadedImages = {},
    },
    ref
  ) {
    const totalParticipants = standings.length;
    const myIdx = currentUserId
      ? standings.findIndex((p) => p.studentId === currentUserId)
      : -1;
    const myRank = myIdx >= 0 ? myIdx + 1 : null;
    const myStanding = myIdx >= 0 ? standings[myIdx] : null;
    const topPercentile = computeTopPercentile(myRank, totalParticipants);

    const hasPhotoBg =
      (backgroundMode === 'gallery' || backgroundMode === 'camera') &&
      Boolean(backgroundPhotoUrl);
    const isTransparent = backgroundMode === 'transparent' || !hasPhotoBg;

    const resolveImgSrc = (url?: string | null): string | null => {
      if (!url) return null;
      if (url.startsWith('data:') || url.startsWith('blob:')) return url;
      return preloadedImages[url] || null;
    };

    const appLogoSrc =
      resolveImgSrc(challengeLogoUrl) ||
      preloadedImages['/icon-192.png'] ||
      '/icon-192.png';

    const titleClean = (challengeTitle || 'Desafio Oficial').trim();
    const titleFontSize =
      titleClean.length > 42
        ? '38px'
        : titleClean.length > 26
        ? '44px'
        : '52px';

    const top1 = standings[0] || null;
    const top2 = standings[1] || null;
    const top3 = standings[2] || null;
    const top4to5 = standings.slice(3, 5);

    // Lista para o Card 2 (Top 10; se o usuário estiver fora do Top 10, mostra Top 9 + linha #N do usuário)
    const listEntries: Array<{ item: ShareParticipantItem; rank: number; isPinnedSelf?: boolean }> =
      (() => {
        const top10 = standings.slice(0, 10).map((item, idx) => ({
          item,
          rank: idx + 1,
        }));
        if (!isCoachView && myRank && myRank > 10 && myStanding) {
          return [
            ...top10.slice(0, 9),
            {
              item: myStanding,
              rank: myRank,
              isPinnedSelf: true,
            },
          ];
        }
        return top10;
      })();

    return (
      <div
        ref={ref}
        style={{
          width: '1080px',
          height: '1920px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: isTransparent ? 'transparent' : '#09090b',
          color: '#ffffff',
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '84px 68px 72px 68px',
          boxSizing: 'border-box',
          userSelect: 'none',
        }}
      >
        {/* Camada de Foto de Fundo + Overlay Escuro de 30% */}
        {hasPhotoBg && backgroundPhotoUrl && (
          <>
            <img
              src={resolveImgSrc(backgroundPhotoUrl) || backgroundPhotoUrl}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '1080px',
                height: '1920px',
                objectFit: 'cover',
                zIndex: 0,
              }}
            />
            <div
              data-testid="card-photo-overlay-30"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.30)',
                zIndex: 1,
              }}
            />
          </>
        )}

        {/* Conteúdo Principal */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            flex: 1,
          }}
        >
          {/* 1. HEADER: Logo + Nome do Desafio + Título */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 26px',
                borderRadius: '999px',
                backgroundColor: 'rgba(9, 9, 11, 0.72)',
                border: '2px solid rgba(251, 191, 36, 0.48)',
                boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
              }}
            >
              <img
                src={appLogoSrc}
                alt="Logo"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                }}
              />
              <span
                style={{
                  fontSize: '21px',
                  fontWeight: 800,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  color: '#fde047',
                  textShadow: TEXT_SHADOW_SOFT,
                }}
              >
                {variant === 'podium' ? 'RANKING OFICIAL • PÓDIO' : 'RANKING OFICIAL • TOP 10'}
              </span>
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: titleFontSize,
                fontWeight: 900,
                lineHeight: 1.14,
                color: '#ffffff',
                textShadow: TEXT_SHADOW_STRONG,
                maxWidth: '920px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {titleClean}
            </h2>
          </div>

          {/* 2. DESTAQUE DO USUÁRIO: Posição ("3º de 42"), Pontos XP e % ("Top X%" se >= 20) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '28px 36px',
              borderRadius: '34px',
              backgroundColor: 'rgba(9, 9, 11, 0.78)',
              border: '2px solid rgba(251, 191, 36, 0.45)',
              boxShadow: '0 14px 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            {!isCoachView && myStanding && myRank ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', minWidth: 0 }}>
                  <AvatarCircle
                    name={myStanding.name}
                    src={resolveImgSrc(myStanding.avatarUrl)}
                    size={88}
                    borderColor="#fbbf24"
                    badgeText={`#${myRank}`}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '20px',
                          fontWeight: 800,
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                          color: '#fde047',
                          textShadow: TEXT_SHADOW_SOFT,
                        }}
                      >
                        MINHA POSIÇÃO
                      </span>
                      {topPercentile !== null && (
                        <span
                          style={{
                            padding: '5px 14px',
                            borderRadius: '999px',
                            backgroundColor: 'rgba(16, 185, 129, 0.25)',
                            border: '1.5px solid rgba(52, 211, 153, 0.6)',
                            fontSize: '18px',
                            fontWeight: 900,
                            color: '#6ee7b7',
                            textShadow: TEXT_SHADOW_SOFT,
                          }}
                        >
                          Top {topPercentile}%
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '40px',
                        fontWeight: 900,
                        color: '#ffffff',
                        lineHeight: 1.05,
                        textShadow: TEXT_SHADOW_STRONG,
                      }}
                    >
                      {formatRankOfTotal(myRank, totalParticipants)}
                    </div>
                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        color: '#e4e4e7',
                        textShadow: TEXT_SHADOW_SOFT,
                      }}
                    >
                      {formatCardDisplayName(myStanding.name, 22)}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: '48px',
                      fontWeight: 900,
                      color: '#ffffff',
                      lineHeight: 1,
                      textShadow: TEXT_SHADOW_STRONG,
                    }}
                  >
                    {myStanding.points}
                  </div>
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: 800,
                      color: '#fbbf24',
                      letterSpacing: '2px',
                      marginTop: '6px',
                      textShadow: TEXT_SHADOW_SOFT,
                    }}
                  >
                    PONTOS XP
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', minWidth: 0 }}>
                  <AvatarCircle
                    name={top1?.name || 'ArenaFit'}
                    src={resolveImgSrc(top1?.avatarUrl)}
                    size={84}
                    borderColor="#fbbf24"
                    badgeText="#1"
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '19px',
                        fontWeight: 800,
                        letterSpacing: '1.5px',
                        color: '#fde047',
                        textShadow: TEXT_SHADOW_SOFT,
                      }}
                    >
                      PLACAR OFICIAL DA TURMA
                    </span>
                    <div
                      style={{
                        fontSize: '36px',
                        fontWeight: 900,
                        color: '#ffffff',
                        textShadow: TEXT_SHADOW_STRONG,
                      }}
                    >
                      {top1
                        ? `Líder: ${formatCardDisplayName(top1.name, 18)}`
                        : 'Classificação em andamento'}
                    </div>
                    <div
                      style={{
                        fontSize: '21px',
                        fontWeight: 700,
                        color: '#e4e4e7',
                        textShadow: TEXT_SHADOW_SOFT,
                      }}
                    >
                      {totalParticipants}{' '}
                      {totalParticipants === 1 ? 'participante ativo' : 'participantes ativos'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: '44px',
                      fontWeight: 900,
                      color: '#ffffff',
                      lineHeight: 1,
                      textShadow: TEXT_SHADOW_STRONG,
                    }}
                  >
                    {top1?.points ?? 0}
                  </div>
                  <div
                    style={{
                      fontSize: '19px',
                      fontWeight: 800,
                      color: '#fbbf24',
                      letterSpacing: '1.5px',
                      marginTop: '6px',
                      textShadow: TEXT_SHADOW_SOFT,
                    }}
                  >
                    XP LÍDER
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 3. CORPO DO CARD: VARIANTE 1 (PÓDIO TOP 3 + 4º e 5º) vs VARIANTE 2 (LISTA TOP 10) */}
          {variant === 'podium' ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
                gap: '26px',
              }}
            >
              {/* Bloco do Pódio Top 3 */}
              <div
                style={{
                  borderRadius: '38px',
                  backgroundColor: 'rgba(9, 9, 11, 0.76)',
                  border: '2px solid rgba(255, 255, 255, 0.16)',
                  padding: '38px 34px 34px 34px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  flex: 1,
                  boxShadow: '0 18px 48px rgba(0,0,0,0.5)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '21px',
                      fontWeight: 900,
                      letterSpacing: '2px',
                      color: '#fde047',
                      textShadow: TEXT_SHADOW_SOFT,
                    }}
                  >
                    🏆 PÓDIO DE ELITE • TOP 3
                  </span>
                  <span
                    style={{
                      fontSize: '19px',
                      fontWeight: 700,
                      color: '#d4d4d8',
                      textShadow: TEXT_SHADOW_SOFT,
                    }}
                  >
                    {totalParticipants}{' '}
                    {totalParticipants === 1 ? 'COMPETIDOR' : 'COMPETIDORES'}
                  </span>
                </div>

                {/* Colunas 2º | 1º | 3º */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.18fr 1fr',
                    gap: '22px',
                    alignItems: 'end',
                    paddingTop: '24px',
                  }}
                >
                  <PodiumColumn
                    rank={2}
                    participant={top2}
                    avatarSrc={resolveImgSrc(top2?.avatarUrl)}
                    pedestalHeight={210}
                    avatarSize={128}
                    accentColor="#e2e8f0"
                    pedestalBg="linear-gradient(180deg, rgba(148,163,184,0.42) 0%, rgba(15,23,42,0.88) 100%)"
                    label="PRATA"
                  />
                  <PodiumColumn
                    rank={1}
                    participant={top1}
                    avatarSrc={resolveImgSrc(top1?.avatarUrl)}
                    pedestalHeight={285}
                    avatarSize={164}
                    accentColor="#fde047"
                    pedestalBg="linear-gradient(180deg, rgba(251,191,36,0.5) 0%, rgba(69,26,3,0.9) 100%)"
                    label="OURO"
                    isFirst
                  />
                  <PodiumColumn
                    rank={3}
                    participant={top3}
                    avatarSrc={resolveImgSrc(top3?.avatarUrl)}
                    pedestalHeight={175}
                    avatarSize={128}
                    accentColor="#fb923c"
                    pedestalBg="linear-gradient(180deg, rgba(234,88,12,0.42) 0%, rgba(41,19,7,0.88) 100%)"
                    label="BRONZE"
                  />
                </div>
              </div>

              {/* Complemento 4º e 5º colocados (Top 3 a 5 com avatar e pontos) */}
              {top4to5.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {top4to5.map((item, idx) => {
                    const rankPos = idx + 4;
                    const isMe = Boolean(currentUserId && item.studentId === currentUserId);
                    return (
                      <div
                        key={item.studentId || rankPos}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '20px 28px',
                          borderRadius: '26px',
                          backgroundColor: isMe
                            ? 'rgba(251, 191, 36, 0.22)'
                            : 'rgba(9, 9, 11, 0.76)',
                          border: isMe
                            ? '2px solid rgba(251, 191, 36, 0.65)'
                            : '1.5px solid rgba(255, 255, 255, 0.15)',
                          boxShadow: '0 10px 26px rgba(0,0,0,0.4)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0 }}>
                          <div
                            style={{
                              width: '58px',
                              height: '58px',
                              borderRadius: '16px',
                              backgroundColor: 'rgba(0,0,0,0.65)',
                              border: '1.5px solid rgba(255,255,255,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '24px',
                              fontWeight: 900,
                              color: '#fde047',
                              textShadow: TEXT_SHADOW_SOFT,
                              flexShrink: 0,
                            }}
                          >
                            #{rankPos}
                          </div>
                          <AvatarCircle
                            name={item.name}
                            src={resolveImgSrc(item.avatarUrl)}
                            size={62}
                            borderColor="rgba(255,255,255,0.3)"
                          />
                          <span
                            style={{
                              fontSize: '26px',
                              fontWeight: 800,
                              color: '#ffffff',
                              textShadow: TEXT_SHADOW_STRONG,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '460px',
                            }}
                          >
                            {formatCardDisplayName(item.name, 20)}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: '28px',
                            fontWeight: 900,
                            color: '#fde047',
                            textShadow: TEXT_SHADOW_STRONG,
                            flexShrink: 0,
                          }}
                        >
                          {item.points} XP
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* VARIANTE 2: LISTA TOP 10 */
            <div
              style={{
                borderRadius: '36px',
                backgroundColor: 'rgba(9, 9, 11, 0.78)',
                border: '2px solid rgba(255, 255, 255, 0.16)',
                padding: '28px 30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                flex: 1,
                boxShadow: '0 18px 48px rgba(0,0,0,0.5)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 6px 8px 6px',
                }}
              >
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 900,
                    letterSpacing: '2px',
                    color: '#fde047',
                    textShadow: TEXT_SHADOW_SOFT,
                  }}
                >
                  CLASSIFICAÇÃO TOP {Math.min(10, totalParticipants)}
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#d4d4d8',
                    textShadow: TEXT_SHADOW_SOFT,
                  }}
                >
                  PONTUAÇÃO OFICIAL
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  flex: 1,
                  justifyContent: listEntries.length < 6 ? 'flex-start' : 'space-between',
                }}
              >
                {listEntries.map(({ item, rank, isPinnedSelf }) => {
                  const isMe =
                    isPinnedSelf ||
                    (!isCoachView && Boolean(currentUserId && item.studentId === currentUserId));
                  const rankAccent =
                    rank === 1
                      ? '#fde047'
                      : rank === 2
                      ? '#e2e8f0'
                      : rank === 3
                      ? '#fb923c'
                      : '#ffffff';

                  return (
                    <div
                      key={`${item.studentId}-${rank}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '13px 20px',
                        borderRadius: '20px',
                        backgroundColor: isMe
                          ? 'rgba(251, 191, 36, 0.24)'
                          : rank <= 3
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(255, 255, 255, 0.04)',
                        border: isMe
                          ? '2px solid rgba(251, 191, 36, 0.7)'
                          : '1.5px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
                        <div
                          style={{
                            width: '54px',
                            height: '46px',
                            borderRadius: '13px',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            border: `1.5px solid ${rank <= 3 ? rankAccent : 'rgba(255,255,255,0.18)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '21px',
                            fontWeight: 900,
                            color: rankAccent,
                            textShadow: TEXT_SHADOW_SOFT,
                            flexShrink: 0,
                          }}
                        >
                          #{rank}
                        </div>

                        <AvatarCircle
                          name={item.name}
                          src={resolveImgSrc(item.avatarUrl)}
                          size={50}
                          borderColor={rank <= 3 ? rankAccent : 'rgba(255,255,255,0.28)'}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: '23px',
                              fontWeight: 800,
                              color: '#ffffff',
                              textShadow: TEXT_SHADOW_STRONG,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: isMe ? '410px' : '480px',
                            }}
                          >
                            {formatCardDisplayName(item.name, 20)}
                          </span>
                          {isMe && (
                            <span
                              style={{
                                padding: '3px 10px',
                                borderRadius: '8px',
                                backgroundColor: '#fbbf24',
                                color: '#000000',
                                fontSize: '15px',
                                fontWeight: 900,
                              }}
                            >
                              VOCÊ
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '24px',
                          fontWeight: 900,
                          color: rank <= 3 || isMe ? '#fde047' : '#ffffff',
                          textShadow: TEXT_SHADOW_STRONG,
                          flexShrink: 0,
                        }}
                      >
                        {item.points} XP
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 4. RODAPÉ: Marca d'água oficial do app */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            marginTop: '28px',
            padding: '18px 30px',
            borderRadius: '999px',
            backgroundColor: 'rgba(9, 9, 11, 0.72)',
            border: '1.5px solid rgba(255, 255, 255, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={appLogoSrc}
              alt="ArenaFitPro"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                objectFit: 'cover',
              }}
            />
            <span
              style={{
                fontSize: '21px',
                fontWeight: 900,
                letterSpacing: '1.5px',
                color: '#ffffff',
                textShadow: TEXT_SHADOW_STRONG,
              }}
            >
              ARENAFITPRO
            </span>
          </div>

          <span
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#fde047',
              textShadow: TEXT_SHADOW_SOFT,
            }}
          >
            arenafitpro.com.br
          </span>
        </div>
      </div>
    );
  }
);

function AvatarCircle({
  name,
  src,
  size,
  borderColor,
  badgeText,
}: {
  name: string;
  src?: string | null;
  size: number;
  borderColor: string;
  badgeText?: string;
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${Math.round(size * 0.32)}px`,
          backgroundColor: '#18181b',
          border: `3px solid ${borderColor}`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(0,0,0,0.45)',
        }}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <span
            style={{
              fontSize: `${Math.round(size * 0.36)}px`,
              fontWeight: 900,
              color: '#fde047',
              textShadow: TEXT_SHADOW_SOFT,
            }}
          >
            {getInitials(name)}
          </span>
        )}
      </div>

      {badgeText && (
        <div
          style={{
            position: 'absolute',
            bottom: '-6px',
            right: '-6px',
            padding: '3px 10px',
            borderRadius: '999px',
            backgroundColor: '#fbbf24',
            border: '2px solid #09090b',
            color: '#000000',
            fontSize: '16px',
            fontWeight: 900,
            lineHeight: 1.1,
          }}
        >
          {badgeText}
        </div>
      )}
    </div>
  );
}

function PodiumColumn({
  rank,
  participant,
  avatarSrc,
  pedestalHeight,
  avatarSize,
  accentColor,
  pedestalBg,
  label,
  isFirst = false,
}: {
  rank: 1 | 2 | 3;
  participant: ShareParticipantItem | null;
  avatarSrc?: string | null;
  pedestalHeight: number;
  avatarSize: number;
  accentColor: string;
  pedestalBg: string;
  label: string;
  isFirst?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {participant ? (
        <>
          {isFirst && (
            <div
              style={{
                fontSize: '42px',
                lineHeight: 1,
                marginBottom: '8px',
                filter: 'drop-shadow(0 4px 10px rgba(251,191,36,0.6))',
              }}
            >
              👑
            </div>
          )}

          <AvatarCircle
            name={participant.name}
            src={avatarSrc}
            size={avatarSize}
            borderColor={accentColor}
            badgeText={`${rank}º`}
          />

          <div
            style={{
              marginTop: '16px',
              fontSize: isFirst ? '27px' : '23px',
              fontWeight: 900,
              color: '#ffffff',
              textShadow: TEXT_SHADOW_STRONG,
              maxWidth: isFirst ? '270px' : '220px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            { truncateWithEllipsis(participant.name.split(' ')[0] || participant.name, 14) }
          </div>

          <div
            style={{
              marginTop: '4px',
              marginBottom: '14px',
              fontSize: isFirst ? '25px' : '21px',
              fontWeight: 900,
              color: accentColor,
              textShadow: TEXT_SHADOW_STRONG,
            }}
          >
            {participant.points} XP
          </div>
        </>
      ) : (
        <div
          style={{
            marginBottom: '18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: 0.45,
          }}
        >
          <div
            style={{
              width: `${avatarSize - 18}px`,
              height: `${avatarSize - 18}px`,
              borderRadius: '28px',
              border: '2px dashed rgba(255,255,255,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 800,
              color: '#a1a1aa',
            }}
          >
            —
          </div>
          <span
            style={{
              marginTop: '12px',
              fontSize: '20px',
              fontWeight: 700,
              color: '#a1a1aa',
              textShadow: TEXT_SHADOW_SOFT,
            }}
          >
            —
          </span>
        </div>
      )}

      {/* Pedestal */}
      <div
        style={{
          width: '100%',
          height: `${pedestalHeight}px`,
          borderRadius: '28px 28px 18px 18px',
          background: participant ? pedestalBg : 'rgba(255, 255, 255, 0.04)',
          border: participant
            ? `2.5px solid ${accentColor}`
            : '2px dashed rgba(255, 255, 255, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: participant ? '0 12px 30px rgba(0,0,0,0.45)' : 'none',
        }}
      >
        <span
          style={{
            fontSize: isFirst ? '58px' : '44px',
            fontWeight: 900,
            lineHeight: 1,
            color: participant ? accentColor : '#71717a',
            textShadow: TEXT_SHADOW_STRONG,
          }}
        >
          {rank}º
        </span>
        <span
          style={{
            fontSize: '17px',
            fontWeight: 800,
            letterSpacing: '2.5px',
            color: '#f4f4f5',
            textShadow: TEXT_SHADOW_SOFT,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
