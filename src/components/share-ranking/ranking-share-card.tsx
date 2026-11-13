'use client';

import React, { forwardRef } from 'react';
import { formatCardDisplayName, truncateWithEllipsis } from '@/lib/share/ranking-format';

export interface ShareParticipantItem {
  studentId: string;
  name: string;
  avatarUrl?: string | null;
  points: number;
  streakDays?: number;
}

export type RankingCardVariant = 'list' | 'hero';
export type RankingBgMode = 'transparent' | 'gallery' | 'camera';

export interface RankingShareCardProps {
  variant: RankingCardVariant;
  challengeTitle: string;
  challengeLogoUrl?: string | null;
  coachLogoUrl?: string | null;
  coachBrandName?: string | null;
  standings: ShareParticipantItem[];
  currentUserId?: string | null;
  isCoachView?: boolean;
  backgroundMode: RankingBgMode;
  backgroundPhotoUrl?: string | null;
  preloadedImages?: Record<string, string>;
}

const GOLD = '#fbbf24';
const SILVER = '#e2e8f0';
const BRONZE = '#f59e0b';
const ELECTRIC_BLUE = '#3478F6';
const TEXT_SHADOW = '0 2px 14px rgba(0, 0, 0, 0.75), 0 1px 4px rgba(0, 0, 0, 0.85)';

function getInitials(text: string): string {
  const parts = text
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'P';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const RankingShareCard = forwardRef<HTMLDivElement, RankingShareCardProps>(
  function RankingShareCard(
    {
      variant,
      challengeTitle,
      challengeLogoUrl,
      coachLogoUrl,
      coachBrandName,
      standings,
      currentUserId,
      isCoachView = false,
      backgroundMode,
      backgroundPhotoUrl,
      preloadedImages = {},
    },
    ref
  ) {
    const safeStandings = Array.isArray(standings) ? standings : [];
    const totalParticipants = safeStandings.length;
    const myIdx = currentUserId
      ? safeStandings.findIndex((p) => p.studentId === currentUserId)
      : -1;
    const myRank = myIdx >= 0 ? myIdx + 1 : safeStandings.length > 0 ? 1 : null;
    const myStanding = myIdx >= 0 ? safeStandings[myIdx] : safeStandings[0] || null;
    const myPoints = myStanding ? myStanding.points : 0;

    const hasPhotoBg =
      (backgroundMode === 'gallery' || backgroundMode === 'camera') &&
      Boolean(backgroundPhotoUrl);
    const isTransparent = backgroundMode === 'transparent' || !hasPhotoBg;

    const resolveImgSrc = (url?: string | null): string | null => {
      if (!url) return null;
      if (url.startsWith('data:') || url.startsWith('blob:')) return url;
      return preloadedImages[url] || url;
    };

    // Logo superior: do Personal Trainer (ou logo customizado escolhido)
    const rawPersonalLogo = coachLogoUrl ?? challengeLogoUrl ?? null;
    const personalLogoSrc = resolveImgSrc(rawPersonalLogo);

    // Nome de escolha do Personal Trainer
    const cleanBrandName = coachBrandName?.trim()
      ? truncateWithEllipsis(coachBrandName.trim(), 32)
      : '';

    // Marca d'água inferior: SEMPRE ArenaFitPro
    const arenaWatermarkLogoSrc =
      preloadedImages['/icon-192.png'] || '/icon-192.png';

    const cleanChallengeTitle = truncateWithEllipsis(
      (challengeTitle || 'Desafio Oficial').trim(),
      38
    );

    const personalInitials = getInitials(cleanBrandName || cleanChallengeTitle);

    // Top 5 participantes existentes (sem placeholders vazios).
    // Se o usuário estiver abaixo do 5º lugar, exibe os 4 primeiros + o usuário na 5ª linha.
    const topFiveEntries: Array<{ item: ShareParticipantItem; rank: number }> = (() => {
      const top5 = safeStandings.slice(0, 5).map((item, index) => ({
        item,
        rank: index + 1,
      }));
      if (!isCoachView && myIdx >= 5 && safeStandings[myIdx]) {
        return [
          ...top5.slice(0, 4),
          {
            item: safeStandings[myIdx],
            rank: myIdx + 1,
          },
        ];
      }
      return top5;
    })();

    return (
      <div
        ref={ref}
        style={{
          width: '1080px',
          height: '1920px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: isTransparent ? 'transparent' : '#000000',
          color: '#ffffff',
          fontFamily:
            '"Plus Jakarta Sans", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '96px 104px 88px 104px',
          boxSizing: 'border-box',
          userSelect: 'none',
        }}
      >
        {/* Foto de fundo + Overlay escuro de 30% */}
        {hasPhotoBg && backgroundPhotoUrl && (
          <>
            <img
              data-role="card-bg-photo"
              src={resolveImgSrc(backgroundPhotoUrl) || backgroundPhotoUrl}
              alt=""
              width={1080}
              height={1920}
              decoding="sync"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
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
                top: 0,
                left: 0,
                width: '1080px',
                height: '1920px',
                backgroundColor: 'rgba(0, 0, 0, 0.30)',
                zIndex: 1,
              }}
            />
          </>
        )}

        {/* Conteúdo concentrado na metade inferior (deixando a metade superior livre para a foto) */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            minHeight: '860px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          {variant === 'list' ? (
            /* ================================================================
             * CARD 1 (LISTA): Estilo Master Training
             * ================================================================ */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              {/* Logo superior do Personal + Nome de escolha */}
              {personalLogoSrc ? (
                <img
                  data-role="card-coach-logo"
                  src={personalLogoSrc}
                  alt={cleanBrandName || 'Personal'}
                  width={60}
                  height={60}
                  decoding="sync"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    objectFit: 'cover',
                    marginBottom: cleanBrandName ? '12px' : '18px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    border: '2px solid rgba(251, 191, 36, 0.65)',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: GOLD,
                    textShadow: TEXT_SHADOW,
                    marginBottom: cleanBrandName ? '12px' : '18px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
                  }}
                >
                  {personalInitials}
                </div>
              )}

              {cleanBrandName && (
                <div
                  style={{
                    fontSize: '23px',
                    fontWeight: 700,
                    color: GOLD,
                    textShadow: TEXT_SHADOW,
                    textAlign: 'center',
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}
                >
                  {cleanBrandName}
                </div>
              )}

              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textShadow: TEXT_SHADOW,
                  textAlign: 'center',
                  letterSpacing: '0.3px',
                }}
              >
                {cleanChallengeTitle}
              </div>

              <div
                style={{
                  fontSize: '54px',
                  fontWeight: 800,
                  color: '#ffffff',
                  textShadow: TEXT_SHADOW,
                  textAlign: 'center',
                  lineHeight: 1.12,
                  marginTop: '4px',
                  marginBottom: '44px',
                }}
              >
                Ranking
              </div>

              {/* Faixa de 3 métricas (posição | pontos | atletas) com divisórias finas */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
                  alignItems: 'center',
                  width: '100%',
                  paddingBottom: '34px',
                }}
              >
                {/* Coluna 1: Posição */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '56px',
                      fontWeight: 800,
                      color: '#ffffff',
                      lineHeight: 1.05,
                      textShadow: TEXT_SHADOW,
                    }}
                  >
                    {myRank ? `${myRank}º` : '—'}
                  </span>
                  <span
                    style={{
                      fontSize: '24px',
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.72)',
                      textShadow: TEXT_SHADOW,
                    }}
                  >
                    posição
                  </span>
                </div>

                {/* Divisória fina 1 */}
                <div
                  style={{
                    width: '1px',
                    height: '64px',
                    backgroundColor: 'rgba(255, 255, 255, 0.28)',
                  }}
                />

                {/* Coluna 2: Pontos */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '56px',
                      fontWeight: 800,
                      color: GOLD,
                      lineHeight: 1.05,
                      textShadow: TEXT_SHADOW,
                    }}
                  >
                    {myPoints}
                  </span>
                  <span
                    style={{
                      fontSize: '24px',
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.72)',
                      textShadow: TEXT_SHADOW,
                    }}
                  >
                    pontos
                  </span>
                </div>

                {/* Divisória fina 2 */}
                <div
                  style={{
                    width: '1px',
                    height: '64px',
                    backgroundColor: 'rgba(255, 255, 255, 0.28)',
                  }}
                />

                {/* Coluna 3: Atletas */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '56px',
                      fontWeight: 800,
                      color: '#ffffff',
                      lineHeight: 1.05,
                      textShadow: TEXT_SHADOW,
                    }}
                  >
                    de {totalParticipants}
                  </span>
                  <span
                    style={{
                      fontSize: '24px',
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.72)',
                      textShadow: TEXT_SHADOW,
                    }}
                  >
                    {totalParticipants === 1 ? 'atleta' : 'atletas'}
                  </span>
                </div>
              </div>

              {/* Linha fina dourada */}
              <div
                style={{
                  width: '100%',
                  height: '2px',
                  backgroundColor: GOLD,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                  marginBottom: '38px',
                }}
              />

              {/* Label CLASSIFICAÇÃO + Lista Top 5 (bolinha, nome, pontos à direita em dourado, sem avatar) */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '3.5px',
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.75)',
                    textShadow: TEXT_SHADOW,
                    marginBottom: '4px',
                  }}
                >
                  CLASSIFICAÇÃO
                </div>

                {topFiveEntries.map(({ item, rank }) => {
                  const isMe =
                    !isCoachView &&
                    Boolean(currentUserId && item.studentId === currentUserId);

                  const rankAccentColor =
                    rank === 1
                      ? GOLD
                      : rank === 2
                      ? SILVER
                      : rank === 3
                      ? BRONZE
                      : isMe
                      ? ELECTRIC_BLUE
                      : 'rgba(255, 255, 255, 0.85)';

                  const rankBadgeBg =
                    rank === 1
                      ? 'rgba(251, 191, 36, 0.22)'
                      : rank === 2
                      ? 'rgba(226, 232, 240, 0.20)'
                      : rank === 3
                      ? 'rgba(217, 119, 6, 0.28)'
                      : 'rgba(24, 24, 27, 0.75)';

                  const rankBadgeBorder =
                    rank === 1
                      ? 'rgba(251, 191, 36, 0.65)'
                      : rank === 2
                      ? 'rgba(226, 232, 240, 0.55)'
                      : rank === 3
                      ? 'rgba(245, 158, 11, 0.65)'
                      : 'rgba(255, 255, 255, 0.22)';

                  return (
                    <div
                      key={`${item.studentId}-${rank}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: isMe ? '8px 14px' : '2px 4px',
                        borderRadius: '16px',
                        backgroundColor: isMe ? 'rgba(52, 120, 246, 0.18)' : 'transparent',
                        border: isMe ? '1.5px solid rgba(52, 120, 246, 0.45)' : '1.5px solid transparent',
                        boxSizing: 'border-box',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            minWidth: '44px',
                            height: '36px',
                            padding: '0 8px',
                            borderRadius: '999px',
                            backgroundColor: rankBadgeBg,
                            border: `1.5px solid ${rankBadgeBorder}`,
                            color: rankAccentColor,
                            fontSize: '20px',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.65)',
                            flexShrink: 0,
                          }}
                        >
                          {rank}º
                        </span>
                        <span
                          style={{
                            fontSize: '34px',
                            fontWeight: isMe || rank <= 3 ? 800 : 600,
                            color: isMe ? '#ffffff' : rank === 1 ? GOLD : '#ffffff',
                            textShadow: TEXT_SHADOW,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '560px',
                          }}
                        >
                          {formatCardDisplayName(item.name, 26)}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '34px',
                          fontWeight: 800,
                          color: rank <= 3 ? rankAccentColor : isMe ? '#75A7FF' : '#ffffff',
                          textShadow: TEXT_SHADOW,
                          flexShrink: 0,
                        }}
                      >
                        {item.points} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ================================================================
             * CARD 2 (HERÓI): Logo do Personal + Nome de Escolha + Posição gigante
             * ================================================================ */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                width: '100%',
                paddingBottom: '28px',
              }}
            >
              {/* Logo superior do Personal + Nome de escolha */}
              {personalLogoSrc ? (
                <img
                  data-role="card-coach-logo"
                  src={personalLogoSrc}
                  alt={cleanBrandName || 'Personal'}
                  width={60}
                  height={60}
                  decoding="sync"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    objectFit: 'cover',
                    marginBottom: cleanBrandName ? '12px' : '16px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    border: '2px solid rgba(251, 191, 36, 0.65)',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: GOLD,
                    textShadow: TEXT_SHADOW,
                    marginBottom: cleanBrandName ? '12px' : '16px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
                  }}
                >
                  {personalInitials}
                </div>
              )}

              {cleanBrandName && (
                <div
                  style={{
                    fontSize: '23px',
                    fontWeight: 700,
                    color: GOLD,
                    textShadow: TEXT_SHADOW,
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}
                >
                  {cleanBrandName}
                </div>
              )}

              {/* Nome do desafio */}
              <div
                style={{
                  fontSize: '30px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textShadow: TEXT_SHADOW,
                  marginBottom: '18px',
                }}
              >
                {cleanChallengeTitle}
              </div>

              {/* Número da posição gigante */}
              <div
                style={{
                  fontSize: '230px',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 0.92,
                  letterSpacing: '-4px',
                  textShadow: TEXT_SHADOW,
                }}
              >
                {myRank ? `${myRank}º` : '1º'}
              </div>

              {/* "de N atletas" */}
              <div
                style={{
                  fontSize: '38px',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.82)',
                  textShadow: TEXT_SHADOW,
                  marginTop: '14px',
                }}
              >
                de {totalParticipants} {totalParticipants === 1 ? 'atleta' : 'atletas'}
              </div>

              {/* Linha fina dourada */}
              <div
                style={{
                  width: '180px',
                  height: '3px',
                  backgroundColor: GOLD,
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                  marginTop: '36px',
                  marginBottom: '32px',
                }}
              />

              {/* Pontos em dourado */}
              <div
                style={{
                  fontSize: '52px',
                  fontWeight: 800,
                  color: GOLD,
                  lineHeight: 1.1,
                  textShadow: TEXT_SHADOW,
                }}
              >
                {myPoints} XP
              </div>
            </div>
          )}

          {/* Rodapé inferior: SEMPRE marca d'água do ArenaFitPro em opacidade baixa */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '64px',
              opacity: 0.55,
            }}
          >
            <img
              data-role="card-arena-watermark"
              src={arenaWatermarkLogoSrc}
              alt="ArenaFitPro"
              width={32}
              height={32}
              decoding="sync"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                objectFit: 'cover',
              }}
            />
            <span
              style={{
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '2px',
                color: '#ffffff',
                textShadow: TEXT_SHADOW,
              }}
            >
              ARENAFITPRO
            </span>
          </div>
        </div>
      </div>
    );
  }
);
