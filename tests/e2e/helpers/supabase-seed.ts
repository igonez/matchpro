import fs from 'node:fs';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const AUTH_DIR = path.resolve(process.cwd(), 'tests/e2e/.auth');
export const SEED_STATE_PATH = path.join(AUTH_DIR, 'seed-state.json');
export const COACH_AUTH_PATH = path.join(AUTH_DIR, 'coach.json');
export const STUDENT_AUTH_PATH = path.join(AUTH_DIR, 'student.json');

export interface SeedState {
  runId: string;
  coachId: string;
  coachEmail: string;
  coachPassword: string;
  studentId: string;
  studentEmail: string;
  studentPassword: string;
  challengeId: string;
  challengeTitle: string;
  weekIds: string[];
  customListId: string;
  missions: {
    timerMissionId: string;
    timerMissionTitle: string;
    mealMissionId: string;
    mealMissionTitle: string;
    simpleClickMissionId: string;
    simpleClickMissionTitle: string;
    textMissionId: string;
    textMissionTitle: string;
  };
  pendingSubmissionIds: string[];
  uploadedStoragePaths: string[];
}

export function loadEnvLocal(baseDir: string = process.cwd()): void {
  const envPath = path.join(baseDir, '.env.local');
  if (!fs.existsSync(envPath)) return;

  const rawContent = fs.readFileSync(envPath, 'utf8');
  const content =
    rawContent.charCodeAt(0) === 0xfeff ? rawContent.slice(1) : rawContent;
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const normalized = trimmed.startsWith('export ')
      ? trimmed.slice('export '.length).trim()
      : trimmed;

    const eqIndex = normalized.indexOf('=');
    if (eqIndex <= 0) continue;

    const key = normalized.slice(0, eqIndex).trim();
    let value = normalized.slice(eqIndex + 1).trim();

    if (value.startsWith('"') || value.startsWith("'")) {
      const quote = value[0];
      const closingIdx = value.indexOf(quote, 1);
      if (closingIdx !== -1) {
        value = value.slice(1, closingIdx);
      }
    } else {
      const commentIdx = value.indexOf('#');
      if (commentIdx !== -1) {
        value = value.slice(0, commentIdx).trim();
      }
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function getSupabaseAdmin(): SupabaseClient {
  loadEnvLocal();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment / .env.local'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function readSeedState(): SeedState {
  if (!fs.existsSync(SEED_STATE_PATH)) {
    throw new Error(`Seed state file not found at ${SEED_STATE_PATH}. Did globalSetup run?`);
  }
  const raw = fs.readFileSync(SEED_STATE_PATH, 'utf8');
  return JSON.parse(raw) as SeedState;
}

function formatSaoPauloDateOffset(offsetDays: number): string {
  const target = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(target);
}

function resolveFixtureImageBuffer(): Buffer {
  const fixturePath = path.resolve(process.cwd(), 'tests/e2e/fixtures/sample-meal.jpg');
  if (fs.existsSync(fixturePath)) {
    return fs.readFileSync(fixturePath);
  }
  const fallbackPath = path.resolve(
    process.cwd(),
    'public/images/mockups/student-workout-selfie.jpg'
  );
  if (fs.existsSync(fallbackPath)) {
    return fs.readFileSync(fallbackPath);
  }
  throw new Error('Fixture image not found at tests/e2e/fixtures/sample-meal.jpg');
}

export async function seedE2EEnvironment(): Promise<SeedState> {
  const supabaseAdmin = getSupabaseAdmin();
  const runId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const coachEmail = `e2e-coach-${runId}@arenafitpro.test`;
  const studentEmail = `e2e-student-${runId}@arenafitpro.test`;
  const coachPassword = `E2eCoach!${runId}99`;
  const studentPassword = `E2eStudent!${runId}99`;

  const partialState: SeedState = {
    runId,
    coachId: '',
    coachEmail,
    coachPassword,
    studentId: '',
    studentEmail,
    studentPassword,
    challengeId: '',
    challengeTitle: `Desafio E2E ${runId}`,
    weekIds: [],
    customListId: '',
    missions: {
      timerMissionId: '',
      timerMissionTitle: 'Treino Força E2E',
      mealMissionId: '',
      mealMissionTitle: 'Almoço Proteico E2E',
      simpleClickMissionId: '',
      simpleClickMissionTitle: 'Hidratação 3L E2E',
      textMissionId: '',
      textMissionTitle: 'Meta Diária Reflexão E2E',
    },
    pendingSubmissionIds: [],
    uploadedStoragePaths: [],
  };

  try {
    // 1. Create Ephemeral Coach Auth User
    const { data: coachAuth, error: coachAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email: coachEmail,
        password: coachPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Coach E2E',
          role: 'professional',
        },
        app_metadata: {
          role: 'professional',
        },
      });

    if (coachAuthError || !coachAuth.user) {
      throw new Error(`Failed creating E2E coach auth user: ${coachAuthError?.message}`);
    }
    partialState.coachId = coachAuth.user.id;

    // 2. Create Ephemeral Student Auth User
    const { data: studentAuth, error: studentAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email: studentEmail,
        password: studentPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Atleta E2E',
          role: 'student',
        },
        app_metadata: {
          role: 'student',
        },
      });

    if (studentAuthError || !studentAuth.user) {
      throw new Error(`Failed creating E2E student auth user: ${studentAuthError?.message}`);
    }
    partialState.studentId = studentAuth.user.id;

    // 3. Insert professionals row (PRO tier, 0% platform fee, Studio E2E brand)
    const { error: profError } = await supabaseAdmin.from('professionals').insert({
      id: partialState.coachId,
      full_name: 'Coach E2E',
      brand_name: 'Studio E2E',
      brand_logo_url: '/app-logo.png',
      avatar_url: null,
      specialty: 'personal_trainer',
      plan_tier: 'pro',
      plan_status: 'active',
      platform_fee_percent: 0,
    });
    if (profError) {
      throw new Error(`Failed inserting professionals row: ${profError.message}`);
    }

    // 4. Insert students row
    const { error: studentError } = await supabaseAdmin.from('students').insert({
      id: partialState.studentId,
      full_name: 'Atleta E2E',
      phone: '11999999999',
      avatar_url: null,
    });
    if (studentError) {
      throw new Error(`Failed inserting students row: ${studentError.message}`);
    }

    // 5. Insert active 4-week challenge covering today
    const startDate = formatSaoPauloDateOffset(-3);
    const endDate = formatSaoPauloDateOffset(25);

    const { data: challengeRow, error: challengeError } = await supabaseAdmin
      .from('challenges')
      .insert({
        professional_id: partialState.coachId,
        title: partialState.challengeTitle,
        start_date: startDate,
        end_date: endDate,
        price: 0,
        is_active: true,
      })
      .select('id')
      .single();

    if (challengeError || !challengeRow) {
      throw new Error(`Failed inserting challenge: ${challengeError?.message}`);
    }
    partialState.challengeId = challengeRow.id as string;

    // 6. Insert 4 challenge_weeks
    const weekRows = [1, 2, 3, 4].map((weekNum) => ({
      challenge_id: partialState.challengeId,
      week_number: weekNum,
      title: `Semana ${weekNum}`,
      bonus_points: 20,
      start_date: formatSaoPauloDateOffset(-3 + (weekNum - 1) * 7),
      end_date: formatSaoPauloDateOffset(-3 + weekNum * 7 - 1),
    }));

    const { data: insertedWeeks, error: weeksError } = await supabaseAdmin
      .from('challenge_weeks')
      .insert(weekRows)
      .select('id, week_number')
      .order('week_number', { ascending: true });

    if (weeksError || !insertedWeeks || insertedWeeks.length === 0) {
      throw new Error(`Failed inserting challenge_weeks: ${weeksError?.message}`);
    }
    partialState.weekIds = insertedWeeks.map((w) => w.id as string);
    const week1Id = partialState.weekIds[0];

    // 7. Insert 1 custom challenge_mission_lists row (NO is_daily_reset column in live DB)
    const { data: customList, error: listError } = await supabaseAdmin
      .from('challenge_mission_lists')
      .insert({
        challenge_id: partialState.challengeId,
        name: 'Metas & Reflexão',
        key: 'meta',
        icon: 'Target',
        validation_type: 'text',
        daily_limit: 1,
        order_index: 5,
      })
      .select('id')
      .single();

    if (listError || !customList) {
      throw new Error(`Failed inserting challenge_mission_lists: ${listError?.message}`);
    }
    partialState.customListId = customList.id as string;

    // 8. Insert 4 missions (NOTE: category MUST satisfy missions_category_check; use 'outro' for text/meta)
    const { data: insertedMissions, error: missionsError } = await supabaseAdmin
      .from('missions')
      .insert([
        {
          challenge_id: partialState.challengeId,
          week_id: week1Id,
          category: 'treino',
          validation_type: 'timer',
          title: partialState.missions.timerMissionTitle,
          points_rewarded: 15,
          is_daily_reset: false,
          daily_limit: 1,
          target_frequency: 1,
          order_index: 1,
        },
        {
          challenge_id: partialState.challengeId,
          week_id: week1Id,
          category: 'refeicao',
          validation_type: 'photo',
          title: partialState.missions.mealMissionTitle,
          points_rewarded: 10,
          is_daily_reset: true,
          daily_limit: 1,
          target_frequency: 7,
          order_index: 2,
        },
        {
          challenge_id: partialState.challengeId,
          week_id: week1Id,
          category: 'habito',
          validation_type: 'simple_click',
          title: partialState.missions.simpleClickMissionTitle,
          points_rewarded: 10,
          is_daily_reset: true,
          daily_limit: 1,
          target_frequency: 7,
          order_index: 3,
        },
        {
          challenge_id: partialState.challengeId,
          week_id: week1Id,
          list_id: partialState.customListId,
          category: 'outro',
          validation_type: 'text',
          title: partialState.missions.textMissionTitle,
          points_rewarded: 10,
          is_daily_reset: false,
          daily_limit: 1,
          target_frequency: 1,
          order_index: 4,
        },
      ])
      .select('id, validation_type');

    if (missionsError || !insertedMissions || insertedMissions.length < 4) {
      throw new Error(`Failed inserting missions: ${missionsError?.message}`);
    }

    for (const m of insertedMissions) {
      if (m.validation_type === 'timer') partialState.missions.timerMissionId = m.id as string;
      if (m.validation_type === 'photo') partialState.missions.mealMissionId = m.id as string;
      if (m.validation_type === 'simple_click')
        partialState.missions.simpleClickMissionId = m.id as string;
      if (m.validation_type === 'text') partialState.missions.textMissionId = m.id as string;
    }

    // 9. Enroll student as complimentary participant + standings + gamification streak
    const { error: partError } = await supabaseAdmin.from('challenge_participants').insert({
      challenge_id: partialState.challengeId,
      student_id: partialState.studentId,
      payment_status: 'complimentary',
      payment_method: 'complimentary',
    });
    if (partError) {
      throw new Error(`Failed inserting challenge_participants: ${partError.message}`);
    }

    const { error: standingsError } = await supabaseAdmin.from('leaderboard_standings').insert({
      challenge_id: partialState.challengeId,
      student_id: partialState.studentId,
      total_points: 0,
    });
    if (standingsError) {
      throw new Error(`Failed inserting leaderboard_standings: ${standingsError.message}`);
    }

    const { error: gamificationError } = await supabaseAdmin
      .from('student_gamification_state')
      .insert({
        challenge_id: partialState.challengeId,
        student_id: partialState.studentId,
        current_streak: 2,
        best_streak: 2,
        freeze_shields_available: 1,
        freeze_shields_used: 0,
      });
    if (gamificationError) {
      throw new Error(`Failed inserting student_gamification_state: ${gamificationError.message}`);
    }

    // 10. Upload 2 reachable fixture images to Supabase Storage 'submissions' bucket
    const imageBuffer = resolveFixtureImageBuffer();
    const storagePath1 = `${partialState.studentId}/e2e-seed-1.jpg`;
    const storagePath2 = `${partialState.studentId}/e2e-seed-2.jpg`;

    for (const storagePath of [storagePath1, storagePath2]) {
      const { error: uploadError } = await supabaseAdmin.storage
        .from('submissions')
        .upload(storagePath, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });
      if (uploadError) {
        throw new Error(`Failed uploading seed image ${storagePath}: ${uploadError.message}`);
      }
      partialState.uploadedStoragePaths.push(storagePath);
    }

    const url1 = supabaseAdmin.storage.from('submissions').getPublicUrl(storagePath1).data
      .publicUrl;
    const url2 = supabaseAdmin.storage.from('submissions').getPublicUrl(storagePath2).data
      .publicUrl;

    // Seed with yesterday timestamps so mission-share.spec.ts can still submit mealMissionId today without hitting daily anti-duplication.
    const yesterdayMinus2h = new Date(Date.now() - 28 * 3_600_000).toISOString();
    const yesterdayMinus1h = new Date(Date.now() - 27 * 3_600_000).toISOString();

    const { data: pendingSubs, error: subError } = await supabaseAdmin
      .from('student_submissions')
      .insert([
        {
          challenge_id: partialState.challengeId,
          mission_id: partialState.missions.timerMissionId,
          student_id: partialState.studentId,
          photo_url: url1,
          status: 'pending',
          caption: 'Registro E2E Pendente #1',
          submitted_at: yesterdayMinus2h,
        },
        {
          challenge_id: partialState.challengeId,
          mission_id: partialState.missions.mealMissionId,
          student_id: partialState.studentId,
          photo_url: url2,
          status: 'pending',
          caption: 'Refeição E2E Pendente #2',
          submitted_at: yesterdayMinus1h,
        },
      ])
      .select('id');

    if (subError || !pendingSubs || pendingSubs.length < 2) {
      throw new Error(`Failed inserting pending student_submissions: ${subError?.message}`);
    }

    partialState.pendingSubmissionIds = pendingSubs.map((s) => s.id as string);

    fs.mkdirSync(AUTH_DIR, { recursive: true });
    fs.writeFileSync(SEED_STATE_PATH, JSON.stringify(partialState, null, 2), 'utf8');

    return partialState;
  } catch (err) {
    await cleanupSeededEnvironment(partialState).catch(() => undefined);
    throw err;
  }
}

/**
 * Ensures the Swipe Audit queue has exactly 2 pending submissions (sorted submitted_at DESC by /dashboard/audit):
 * #1 (newest today, timerMissionId) and #2 (earlier today, mealMissionId),
 * so approving #1 leaves #2 as REGISTRO 1 DE 1, and rejecting #2 triggers same-day rejected status + retry on /app/missions.
 */
export async function ensureTwoPendingSubmissionsForAudit(seed: SeedState): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();

  // Approve any earlier pending submissions (e.g., created by mission-share.spec.ts) so feed/profile stay intact and audit starts at 2 pending items.
  const { error: approveOldError } = await supabaseAdmin
    .from('student_submissions')
    .update({ status: 'approved' })
    .eq('challenge_id', seed.challengeId)
    .eq('status', 'pending');

  if (approveOldError) {
    throw new Error(`Failed clearing older pending submissions: ${approveOldError.message}`);
  }

  const storagePath1 = `${seed.studentId}/e2e-seed-1.jpg`;
  const storagePath2 = `${seed.studentId}/e2e-seed-2.jpg`;
  const url1 = supabaseAdmin.storage.from('submissions').getPublicUrl(storagePath1).data.publicUrl;
  const url2 = supabaseAdmin.storage.from('submissions').getPublicUrl(storagePath2).data.publicUrl;

  // Keep BOTH submissions strictly inside today in America/Sao_Paulo (-03:00),
  // with #1 (timerMissionId) strictly newer than #2 (mealMissionId) to match submitted_at DESC sorting.
  const todayStart = `${formatSaoPauloDateOffset(0)}T00:00:00-03:00`;
  const saoPauloMidnightMs = new Date(todayStart).getTime();
  const nowMs = Date.now();
  const timerTimestamp = new Date(Math.max(nowMs, saoPauloMidnightMs + 120_000)).toISOString();
  const mealTimestamp = new Date(
    Math.max(saoPauloMidnightMs + 60_000, nowMs - 300_000)
  ).toISOString();

  // Delete any existing mealMissionId submissions from today (America/Sao_Paulo) so the newly rejected #2 is authoritative in /app/missions.
  const { error: deleteTodayError } = await supabaseAdmin
    .from('student_submissions')
    .delete()
    .eq('challenge_id', seed.challengeId)
    .eq('student_id', seed.studentId)
    .eq('mission_id', seed.missions.mealMissionId)
    .gte('submitted_at', todayStart);

  if (deleteTodayError) {
    throw new Error(
      `Failed clearing today meal submissions before audit: ${deleteTodayError.message}`
    );
  }

  const { error } = await supabaseAdmin.from('student_submissions').insert([
    {
      challenge_id: seed.challengeId,
      mission_id: seed.missions.timerMissionId,
      student_id: seed.studentId,
      photo_url: url1,
      status: 'pending',
      caption: 'Auditoria E2E #1 (Aprovar)',
      submitted_at: timerTimestamp,
    },
    {
      challenge_id: seed.challengeId,
      mission_id: seed.missions.mealMissionId,
      student_id: seed.studentId,
      photo_url: url2,
      status: 'pending',
      caption: 'Auditoria E2E #2 (Invalidar)',
      submitted_at: mealTimestamp,
    },
  ]);

  if (error) {
    throw new Error(`Failed preparing 2 pending submissions for audit: ${error.message}`);
  }
}

async function listStorageFilesRecursively(
  supabaseAdmin: SupabaseClient,
  bucket: string,
  rootPrefix: string,
  errors: string[]
): Promise<string[]> {
  const files: string[] = [];
  const queue: string[] = [rootPrefix];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const prefix = queue.shift()!;
    if (visited.has(prefix)) continue;
    visited.add(prefix);

    let offset = 0;
    const limit = 100;
    while (true) {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .list(prefix, { limit, offset });

      if (error) {
        errors.push(`storage.list(${bucket}/${prefix}): ${error.message}`);
        break;
      }
      if (!data || data.length === 0) break;

      for (const entry of data) {
        if (!entry.name) continue;
        const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.id === null) {
          queue.push(fullPath);
        } else {
          files.push(fullPath);
        }
      }

      if (data.length < limit) break;
      offset += data.length;
    }
  }

  return files;
}

async function removeStoragePathsInChunks(
  supabaseAdmin: SupabaseClient,
  bucket: string,
  paths: string[],
  errors: string[],
  label: string
): Promise<void> {
  const chunkSize = 100;
  for (let i = 0; i < paths.length; i += chunkSize) {
    const chunk = paths.slice(i, i + chunkSize);
    const { error } = await supabaseAdmin.storage.from(bucket).remove(chunk);
    if (error) {
      errors.push(`storage.remove(${label}): ${error.message}`);
    }
  }
}

async function deleteByScope(
  supabaseAdmin: SupabaseClient,
  challengeIds: string[],
  studentIds: string[],
  coachIds: string[],
  initialErrors: string[] = []
): Promise<void> {
  const errors: string[] = [...initialErrors];
  const recordStep = async (
    label: string,
    op: PromiseLike<{ error: { message: string } | null }>
  ): Promise<void> => {
    const { error } = await op;
    if (error) {
      errors.push(`${label}: ${error.message}`);
    }
  };

  // Resolve submission IDs tied to challenges or students for child cleanup
  const submissionIds = new Set<string>();

  if (challengeIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from('student_submissions')
      .select('id')
      .in('challenge_id', challengeIds);
    if (error) {
      errors.push(`select student_submissions(challenge_id): ${error.message}`);
    }
    for (const row of data ?? []) submissionIds.add(row.id as string);
  }

  if (studentIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from('student_submissions')
      .select('id')
      .in('student_id', studentIds);
    if (error) {
      errors.push(`select student_submissions(student_id): ${error.message}`);
    }
    for (const row of data ?? []) submissionIds.add(row.id as string);
  }

  const subIdList = Array.from(submissionIds);
  const allUserIds = [...studentIds, ...coachIds];

  // Steps 1-3: submission children
  if (subIdList.length > 0) {
    await recordStep(
      'delete submission_reports(submission_id)',
      supabaseAdmin.from('submission_reports').delete().in('submission_id', subIdList)
    );
    await recordStep(
      'delete submission_likes(submission_id)',
      supabaseAdmin.from('submission_likes').delete().in('submission_id', subIdList)
    );
    await recordStep(
      'delete submission_comments(submission_id)',
      supabaseAdmin.from('submission_comments').delete().in('submission_id', subIdList)
    );
  }
  if (studentIds.length > 0) {
    await recordStep(
      'delete submission_reports(reporter_student_id)',
      supabaseAdmin.from('submission_reports').delete().in('reporter_student_id', studentIds)
    );
    await recordStep(
      'delete submission_likes(student_id)',
      supabaseAdmin.from('submission_likes').delete().in('student_id', studentIds)
    );
    await recordStep(
      'delete submission_comments(student_id)',
      supabaseAdmin.from('submission_comments').delete().in('student_id', studentIds)
    );
  }
  if (allUserIds.length > 0) {
    await recordStep(
      'delete submission_comments(user_id)',
      supabaseAdmin.from('submission_comments').delete().in('user_id', allUserIds)
    );
  }

  // Step 4: student_submissions
  if (challengeIds.length > 0) {
    await recordStep(
      'delete student_submissions(challenge_id)',
      supabaseAdmin.from('student_submissions').delete().in('challenge_id', challengeIds)
    );
  }
  if (studentIds.length > 0) {
    await recordStep(
      'delete student_submissions(student_id)',
      supabaseAdmin.from('student_submissions').delete().in('student_id', studentIds)
    );
  }

  // Steps 5-11: student/challenge scoped tables
  const challengeAndStudentTables = [
    'student_notifications',
    'student_gamification_state',
    'student_achievements',
    'student_mystery_box_claims',
    'freeze_shield_logs',
    'student_transformation_vault',
    'squad_members',
  ] as const;

  for (const table of challengeAndStudentTables) {
    if (challengeIds.length > 0) {
      await recordStep(
        `delete ${table}(challenge_id)`,
        supabaseAdmin.from(table).delete().in('challenge_id', challengeIds)
      );
    }
    if (studentIds.length > 0) {
      await recordStep(
        `delete ${table}(student_id)`,
        supabaseAdmin.from(table).delete().in('student_id', studentIds)
      );
    }
  }

  // Step 12-16: challenge scoped tables
  if (challengeIds.length > 0) {
    await recordStep(
      'delete challenge_squads(challenge_id)',
      supabaseAdmin.from('challenge_squads').delete().in('challenge_id', challengeIds)
    );
    await recordStep(
      'delete challenge_messages(challenge_id)',
      supabaseAdmin.from('challenge_messages').delete().in('challenge_id', challengeIds)
    );
    await recordStep(
      'delete challenge_announcements(challenge_id)',
      supabaseAdmin.from('challenge_announcements').delete().in('challenge_id', challengeIds)
    );
    await recordStep(
      'delete challenge_materials(challenge_id)',
      supabaseAdmin.from('challenge_materials').delete().in('challenge_id', challengeIds)
    );
    await recordStep(
      'delete challenge_sponsors(challenge_id)',
      supabaseAdmin.from('challenge_sponsors').delete().in('challenge_id', challengeIds)
    );
  }
  if (allUserIds.length > 0) {
    await recordStep(
      'delete challenge_messages(user_id)',
      supabaseAdmin.from('challenge_messages').delete().in('user_id', allUserIds)
    );
  }

  // Steps 17-19: leaderboard & shares
  if (challengeIds.length > 0) {
    await recordStep(
      'delete leaderboard_standings(challenge_id)',
      supabaseAdmin.from('leaderboard_standings').delete().in('challenge_id', challengeIds)
    );
    await recordStep(
      'delete leaderboard_history(challenge_id)',
      supabaseAdmin.from('leaderboard_history').delete().in('challenge_id', challengeIds)
    );
    await recordStep(
      'delete ranking_share_links(challenge_id)',
      supabaseAdmin.from('ranking_share_links').delete().in('challenge_id', challengeIds)
    );
  }
  if (studentIds.length > 0) {
    await recordStep(
      'delete leaderboard_standings(student_id)',
      supabaseAdmin.from('leaderboard_standings').delete().in('student_id', studentIds)
    );
    await recordStep(
      'delete leaderboard_history(student_id)',
      supabaseAdmin.from('leaderboard_history').delete().in('student_id', studentIds)
    );
  }
  if (allUserIds.length > 0) {
    await recordStep(
      'delete ranking_share_links(created_by)',
      supabaseAdmin.from('ranking_share_links').delete().in('created_by', allUserIds)
    );
  }

  // Step 20: payments (ON DELETE SET NULL on challenge_id/student_id -> MUST delete explicitly!)
  if (challengeIds.length > 0) {
    await recordStep(
      'delete payments(challenge_id)',
      supabaseAdmin.from('payments').delete().in('challenge_id', challengeIds)
    );
  }
  if (studentIds.length > 0) {
    await recordStep(
      'delete payments(student_id)',
      supabaseAdmin.from('payments').delete().in('student_id', studentIds)
    );
  }
  if (coachIds.length > 0) {
    await recordStep(
      'delete payments(professional_id)',
      supabaseAdmin.from('payments').delete().in('professional_id', coachIds)
    );
    // Step 21: withdrawals
    await recordStep(
      'delete withdrawals(professional_id)',
      supabaseAdmin.from('withdrawals').delete().in('professional_id', coachIds)
    );
  }

  // Step 22: mystery_box_rewards (NEVER delete global rows where challenge_id IS NULL!)
  if (challengeIds.length > 0) {
    await recordStep(
      'delete mystery_box_rewards(challenge_id)',
      supabaseAdmin.from('mystery_box_rewards').delete().in('challenge_id', challengeIds)
    );
    // Steps 23-26: challenge structure & participants
    await recordStep(
      'delete missions(challenge_id)',
      supabaseAdmin.from('missions').delete().in('challenge_id', challengeIds)
    );
    await recordStep(
      'delete challenge_mission_lists(challenge_id)',
      supabaseAdmin.from('challenge_mission_lists').delete().in('challenge_id', challengeIds)
    );
    await recordStep(
      'delete challenge_weeks(challenge_id)',
      supabaseAdmin.from('challenge_weeks').delete().in('challenge_id', challengeIds)
    );
    await recordStep(
      'delete challenge_participants(challenge_id)',
      supabaseAdmin.from('challenge_participants').delete().in('challenge_id', challengeIds)
    );
  }
  if (studentIds.length > 0) {
    await recordStep(
      'delete challenge_participants(student_id)',
      supabaseAdmin.from('challenge_participants').delete().in('student_id', studentIds)
    );
  }

  // Step 27: challenges
  if (challengeIds.length > 0) {
    await recordStep(
      'delete challenges(id)',
      supabaseAdmin.from('challenges').delete().in('id', challengeIds)
    );
  }
  if (coachIds.length > 0) {
    await recordStep(
      'delete challenges(professional_id)',
      supabaseAdmin.from('challenges').delete().in('professional_id', coachIds)
    );
  }

  // Steps 28-29: students & professionals
  if (studentIds.length > 0) {
    await recordStep(
      'delete students(id)',
      supabaseAdmin.from('students').delete().in('id', studentIds)
    );
  }
  if (coachIds.length > 0) {
    await recordStep(
      'delete professionals(id)',
      supabaseAdmin.from('professionals').delete().in('id', coachIds)
    );
  }

  // Step 30: Supabase Storage 'submissions' bucket cleanup (recursive user folders, avatars/, vault/)
  if (allUserIds.length > 0) {
    for (const uid of allUserIds) {
      const userPaths = await listStorageFilesRecursively(
        supabaseAdmin,
        'submissions',
        uid,
        errors
      );
      if (userPaths.length > 0) {
        await removeStoragePathsInChunks(
          supabaseAdmin,
          'submissions',
          userPaths,
          errors,
          `user:${uid}`
        );
      }
    }

    const avatarPaths = await listStorageFilesRecursively(
      supabaseAdmin,
      'submissions',
      'avatars',
      errors
    );
    const matchingAvatars = avatarPaths.filter((fullPath) => {
      const fileName = path.posix.basename(fullPath);
      return allUserIds.some(
        (uid) => fileName.startsWith(`coach_${uid}_`) || fileName.startsWith(`student_${uid}_`)
      );
    });
    if (matchingAvatars.length > 0) {
      await removeStoragePathsInChunks(
        supabaseAdmin,
        'submissions',
        matchingAvatars,
        errors,
        'avatars'
      );
    }

    const vaultPaths = await listStorageFilesRecursively(
      supabaseAdmin,
      'submissions',
      'vault',
      errors
    );
    const matchingVault = vaultPaths.filter((fullPath) => {
      const fileName = path.posix.basename(fullPath);
      return allUserIds.some((uid) => fileName.startsWith(`vault_${uid}_`));
    });
    if (matchingVault.length > 0) {
      await removeStoragePathsInChunks(
        supabaseAdmin,
        'submissions',
        matchingVault,
        errors,
        'vault'
      );
    }
  }

  // Step 31: Delete Auth users (idempotent if already removed)
  for (const uid of allUserIds) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (!msg.includes('not found') && error.status !== 404) {
        errors.push(`auth.admin.deleteUser(${uid}): ${error.message}`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `E2E teardown encountered ${errors.length} error(s):\n- ${errors.join('\n- ')}`
    );
  }
}

export async function cleanupSeededEnvironment(seed: SeedState | null): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const discoveryErrors: string[] = [];

  const challengeIds = new Set<string>();
  const studentIds = new Set<string>();
  const coachIds = new Set<string>();

  if (seed?.challengeId) challengeIds.add(seed.challengeId);
  if (seed?.studentId) studentIds.add(seed.studentId);
  if (seed?.coachId) coachIds.add(seed.coachId);

  // Safety net: also discover any leftover e2e-*@arenafitpro.test auth users (paginate without cap)
  const perPage = 100;
  let page = 1;
  while (true) {
    const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      discoveryErrors.push(`auth.admin.listUsers(page=${page}): ${error.message}`);
      break;
    }
    if (!usersData?.users || usersData.users.length === 0) break;

    for (const user of usersData.users) {
      const email = user.email ?? '';
      if (email.startsWith('e2e-coach-') && email.endsWith('@arenafitpro.test')) {
        coachIds.add(user.id);
      } else if (email.startsWith('e2e-student-') && email.endsWith('@arenafitpro.test')) {
        studentIds.add(user.id);
      }
    }

    if (usersData.users.length < perPage) break;
    page += 1;
  }

  const coachIdList = Array.from(coachIds);
  if (coachIdList.length > 0) {
    const { data: coachChallenges, error } = await supabaseAdmin
      .from('challenges')
      .select('id')
      .in('professional_id', coachIdList);
    if (error) {
      discoveryErrors.push(`select challenges(professional_id): ${error.message}`);
    }
    for (const c of coachChallenges ?? []) {
      challengeIds.add(c.id as string);
    }
  }

  await deleteByScope(
    supabaseAdmin,
    Array.from(challengeIds),
    Array.from(studentIds),
    coachIdList,
    discoveryErrors
  );
}
