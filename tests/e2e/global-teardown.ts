import fs from 'node:fs';
import {
  COACH_AUTH_PATH,
  SEED_STATE_PATH,
  STUDENT_AUTH_PATH,
  cleanupSeededEnvironment,
  loadEnvLocal,
  type SeedState,
} from './helpers/supabase-seed';

export default async function globalTeardown(): Promise<void> {
  loadEnvLocal();

  let seed: SeedState | null = null;
  if (fs.existsSync(SEED_STATE_PATH)) {
    try {
      seed = JSON.parse(fs.readFileSync(SEED_STATE_PATH, 'utf8')) as SeedState;
    } catch {
      seed = null;
    }
  }

  try {
    await cleanupSeededEnvironment(seed);
  } finally {
    for (const filePath of [SEED_STATE_PATH, COACH_AUTH_PATH, STUDENT_AUTH_PATH]) {
      if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, { force: true });
      }
    }
  }
}
