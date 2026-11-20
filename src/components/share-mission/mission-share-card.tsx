'use client';

import React, { forwardRef } from 'react';
import { formatCardDisplayName, truncateWithEllipsis } from '@/lib/share/ranking-format';

export type MissionBgMode = 'photo' | 'dark' | 'transparent' | 'gallery' | 'camera';
export type MissionCardVariant = 'card' | 'sticker';

export interface MissionSharePayload {
  missionId?: string;
  missionTitle: string;
  missionCategory?: string | null;
  categoryLabel?: string | null;
  pointsRewarded: number;
  status?: 'approved' | 'pending';
  completedAt?: string | null;
  studentName?: string | null;
  challengeTitle?: string | null;
  coachBrandName?: string | null;
  coachLogoUrl?: string | null;
  streakDays?: number | null;
  durationSeconds?: number | null;
  caloriesText?: string | null;
  proteinText?: string | null;
  locationText?: string | null;
  photoUrl?: string | null;
}

export interface MissionShareCardProps {
  variant: MissionCardVariant;
  mission: MissionSharePayload;
  backgroundMode: MissionBgMode;
  backgroundPhotoUrl?: string | null;
  preloadedImages?: Record<string, string>;
}

const GOLD = '#FBBF24';
const ELECTRIC_BLUE = '#3478F6';
const EMERALD = '#10B981';
const AMBER = '#F59E0B';
const TEXT_SHADOW = '0 2px 16px rgba(0, 0, 0, 0.8), 0 1px 4px rgba(0, 0, 0, 0.9)';

function getInitials(text: string): string {
  const parts = text
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'AF';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  if (mins > 0) {
    return `${mins}min ${secs}s`;
  }
  return `${secs}s`;
}

function resolveCategoryBadgeLabel(mission: MissionSharePayload): string {
  if (mission.categoryLabel && mission.categoryLabel.trim()) {
    return truncateWithEllipsis(mission.categoryLabel.trim().toUpperCase(), 24);
  }
  const cat = (mission.missionCategory || '').toLowerCase().trim();
  switch (cat) {
    case 'treino':
      return 'TREINO';
    case 'cardio':
      return 'CARDIO';
    case 'refeicao':
    case 'refeição':
      return 'REFEIÇÃO';
    case 'habito':
    case 'hábito':
      return 'HÁBITO';
    default:
      return 'MISSÃO';
  }
}

function formatCompletedAt(iso?: string | null): string {
  try {
    const dt = iso ? new Date(iso) : new Date();
    if (Number.isNaN(dt.getTime())) {
      return new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return dt.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Hoje';
  }
}

export const MissionShareCard = forwardRef<HTMLDivElement, MissionShareCardProps>(
  function MissionShareCard(
    {
      variant,
      mission,
      backgroundMode,
      backgroundPhotoUrl,
      preloadedImages = {},
    },
    ref
  ) {
    const isPhotoBgMode =
      backgroundMode === 'photo' ||
      backgroundMode === 'gallery' ||
      backgroundMode === 'camera';

    const hasPhotoBg =
      variant === 'card' && isPhotoBgMode && Boolean(backgroundPhotoUrl);

    const isTransparent =
      variant === 'sticker' || backgroundMode === 'transparent';

    const resolveImgSrc = (url?: string | null): string | null => {
      if (!url) return null;
      if (url.startsWith('data:') || url.startsWith('blob:')) return url;
      return preloadedImages[url] || url;
    };

    const resolvedPhotoSrc = hasPhotoBg
      ? resolveImgSrc(backgroundPhotoUrl) || backgroundPhotoUrl || null
      : null;

    const rawCoachLogo =
      preloadedImages.coachLogo ||
      (mission.coachLogoUrl ? resolveImgSrc(mission.coachLogoUrl) : null);

    const cleanCoachBrand = truncateWithEllipsis(
      (
        mission.coachBrandName ||
        mission.challengeTitle ||
        'ArenaFitPro'
      ).trim(),
      34
    );

    const cleanChallengeTitle = truncateWithEllipsis(
      (mission.challengeTitle || 'Desafio Oficial').trim(),
      42
    );

    const coachInitials = getInitials(cleanCoachBrand || cleanChallengeTitle);

    const isPending = mission.status === 'pending';
    const statusLabel = isPending ? 'CHECK-IN REGISTRADO' : 'MISSÃO CONCLUÍDA';
    const statusAccent = isPending ? AMBER : EMERALD;
    const statusBg = isPending
      ? 'rgba(245, 158, 11, 0.18)'
      : 'rgba(16, 185, 129, 0.18)';
    const statusBorder = isPending
      ? 'rgba(245, 158, 11, 0.55)'
      : 'rgba(16, 185, 129, 0.55)';

    const categoryBadge = resolveCategoryBadgeLabel(mission);
    const cleanMissionTitle = truncateWithEllipsis(
      (mission.missionTitle || 'Check-in Realizado').trim(),
      64
    );
    const pointsValue = Math.max(0, Number(mission.pointsRewarded ?? 10));
    const streakCount = Math.max(1, Number(mission.streakDays ?? 1));
    const streakLabel = `Ofensiva: ${streakCount} ${streakCount === 1 ? 'dia' : 'dias'}`;

    const hasDuration =
      typeof mission.durationSeconds === 'number' &&
      mission.durationSeconds > 0;
    const durationText = hasDuration
      ? formatDuration(mission.durationSeconds as number)
      : null;

    const hasMacros = Boolean(mission.caloriesText || mission.proteinText);
    const studentDisplay = formatCardDisplayName(
      mission.studentName || 'Atleta',
      26
    );
    const timestampDisplay = formatCompletedAt(mission.completedAt);

    const arenaWatermarkLogoSrc =
      preloadedImages['/icon-192.png'] || '/icon-192.png';

    return (
      <div
        ref={ref}
        style={{
          width: '1080px',
          height: '1920px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: isTransparent ? 'transparent' : '#000000',
          color: '#FAFAFA',
          fontFamily:
            '"Plus Jakarta Sans", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '108px 92px 92px 92px',
          boxSizing: 'border-box',
          userSelect: 'none',
        }}
      >
        {/* Background Photo + 30% Overlay + Vignette */}
        {hasPhotoBg && resolvedPhotoSrc && (
          <>
            <img
              data-role="card-bg-photo"
              src={resolvedPhotoSrc}
              alt=""
              width={1080}
              height={1920}
              decoding="sync"
              style={{
                position: 'absolute',
                inset: 0,
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0,
              }}
            />
            <div
              data-testid="card-photo-overlay-30"
              style={{
                position: 'absolute',
                inset: 0,
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.30)',
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.12) 32%, rgba(0,0,0,0.28) 54%, rgba(0,0,0,0.88) 100%)',
                zIndex: 1,
              }}
            />
          </>
        )}

        {/* True Black Titanium Glow & Grid Lines when Card without Photo */}
        {!isTransparent && !hasPhotoBg && (
          <>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 50% 18%, rgba(52, 120, 246, 0.22) 0%, rgba(16, 185, 129, 0.08) 38%, rgba(0, 0, 0, 0) 72%)',
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
                backgroundSize: '72px 72px',
                zIndex: 0,
              }}
            />
          </>
        )}

        {/* TOP HEADER: Coach Brand & Challenge Title */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {rawCoachLogo ? (
            <img
              data-role="card-coach-logo"
              src={rawCoachLogo}
              alt={cleanCoachBrand}
              width={76}
              height={76}
              decoding="sync"
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '22px',
                objectFit: 'cover',
                border: '2px solid rgba(255, 255, 255, 0.22)',
                boxShadow: '0 8px 28px rgba(0,0,0,0.65)',
                marginBottom: '16px',
              }}
            />
          ) : (
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '22px',
                border: '2px solid rgba(251, 191, 36, 0.65)',
                backgroundColor: 'rgba(14, 14, 16, 0.82)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 800,
                color: GOLD,
                textShadow: TEXT_SHADOW,
                marginBottom: '16px',
                boxShadow: '0 8px 28px rgba(0,0,0,0.65)',
              }}
            >
              {coachInitials}
            </div>
          )}

          <div
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: GOLD,
              textShadow: TEXT_SHADOW,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            {cleanCoachBrand}
          </div>

          <div
            style={{
              fontSize: '28px',
              fontWeight: 600,
              color: 'rgba(250, 250, 250, 0.86)',
              textShadow: TEXT_SHADOW,
              letterSpacing: '0.4px',
            }}
          >
            {cleanChallengeTitle}
          </div>
        </div>

        {/* BOTTOM / MAIN HUD CARD */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              width: '100%',
              borderRadius: '44px',
              backgroundColor: isTransparent
                ? 'rgba(14, 14, 16, 0.88)'
                : hasPhotoBg
                ? 'rgba(10, 10, 12, 0.78)'
                : 'rgba(14, 14, 16, 0.92)',
              border: '2px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.78)',
              padding: '54px 56px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '34px',
            }}
          >
            {/* Status Pill + Category Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  borderRadius: '999px',
                  backgroundColor: statusBg,
                  border: `2px solid ${statusBorder}`,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={statusAccent}
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span
                  style={{
                    fontSize: '21px',
                    fontWeight: 800,
                    letterSpacing: '2px',
                    color: statusAccent,
                    textTransform: 'uppercase',
                  }}
                >
                  {statusLabel}
                </span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 22px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1.5px solid rgba(255, 255, 255, 0.18)',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D4D4D8"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    color: '#FAFAFA',
                    textTransform: 'uppercase',
                  }}
                >
                  {categoryBadge}
                </span>
              </div>
            </div>

            {/* Mission Title */}
            <div
              style={{
                fontSize: cleanMissionTitle.length > 36 ? '56px' : '66px',
                fontWeight: 900,
                color: '#FAFAFA',
                lineHeight: 1.1,
                letterSpacing: '-1.2px',
                textShadow: TEXT_SHADOW,
                wordBreak: 'break-word',
              }}
            >
              {cleanMissionTitle}
            </div>

            {/* Points + Streak Grid */}
            <div
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: '22px',
                width: '100%',
              }}
            >
              {/* Points Box */}
              <div
                style={{
                  flex: 1,
                  borderRadius: '28px',
                  backgroundColor: 'rgba(52, 120, 246, 0.16)',
                  border: '2px solid rgba(52, 120, 246, 0.48)',
                  padding: '26px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    color: '#A1A1AA',
                    textTransform: 'uppercase',
                  }}
                >
                  RECOMPENSA
                </span>
                <span
                  style={{
                    fontSize: '52px',
                    fontWeight: 900,
                    color: '#FAFAFA',
                    lineHeight: 1.05,
                    textShadow: TEXT_SHADOW,
                  }}
                >
                  +{pointsValue} XP
                </span>
              </div>

              {/* Streak Box */}
              <div
                style={{
                  flex: 1.15,
                  borderRadius: '28px',
                  backgroundColor: 'rgba(251, 191, 36, 0.12)',
                  border: '2px solid rgba(251, 191, 36, 0.42)',
                  padding: '26px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={GOLD}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      letterSpacing: '2px',
                      color: GOLD,
                      textTransform: 'uppercase',
                    }}
                  >
                    CONSISTÊNCIA
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '36px',
                    fontWeight: 800,
                    color: '#FAFAFA',
                    lineHeight: 1.15,
                    textShadow: TEXT_SHADOW,
                  }}
                >
                  {streakLabel}
                </span>
              </div>
            </div>

            {/* Optional Telemetry Row: Duration & AI Macros */}
            {(durationText || hasMacros) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: '20px',
                  width: '100%',
                }}
              >
                {durationText && (
                  <div
                    style={{
                      flex: 1,
                      borderRadius: '24px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1.5px solid rgba(255, 255, 255, 0.14)',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={ELECTRIC_BLUE}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span
                        style={{
                          fontSize: '20px',
                          fontWeight: 700,
                          color: '#A1A1AA',
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                        }}
                      >
                        DURAÇÃO
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '30px',
                        fontWeight: 800,
                        color: '#FAFAFA',
                      }}
                    >
                      {durationText}
                    </span>
                  </div>
                )}

                {hasMacros && (
                  <div
                    style={{
                      flex: 1.4,
                      borderRadius: '24px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1.5px solid rgba(255, 255, 255, 0.14)',
                      padding: '20px 26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={EMERALD}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <span
                        style={{
                          fontSize: '19px',
                          fontWeight: 700,
                          color: '#A1A1AA',
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                        }}
                      >
                        NUTRIÇÃO IA
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                      }}
                    >
                      {mission.caloriesText && (
                        <span
                          style={{
                            fontSize: '28px',
                            fontWeight: 800,
                            color: '#FAFAFA',
                          }}
                        >
                          {mission.caloriesText}
                        </span>
                      )}
                      {mission.proteinText && (
                        <span
                          style={{
                            fontSize: '26px',
                            fontWeight: 800,
                            color: EMERALD,
                            padding: '6px 14px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                          }}
                        >
                          {mission.proteinText} P
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <div
              style={{
                width: '100%',
                height: '1.5px',
                backgroundColor: 'rgba(255, 255, 255, 0.14)',
              }}
            />

            {/* Student Name + Timestamp Footer inside Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1.5px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#FAFAFA',
                  }}
                >
                  {getInitials(studentDisplay)}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#A1A1AA',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    ATLETA
                  </span>
                  <span
                    style={{
                      fontSize: '26px',
                      fontWeight: 800,
                      color: '#FAFAFA',
                    }}
                  >
                    {studentDisplay}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                }}
              >
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#A1A1AA',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  REGISTRO VERIFICADO
                </span>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#D4D4D8',
                  }}
                >
                  {timestampDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* Watermark ArenaFitPro */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              marginTop: '44px',
              opacity: 0.72,
            }}
          >
            <img
              data-role="card-arena-watermark"
              src={arenaWatermarkLogoSrc}
              alt="ArenaFitPro"
              width={36}
              height={36}
              decoding="sync"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                objectFit: 'cover',
              }}
            />
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '3px',
                color: '#FAFAFA',
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
