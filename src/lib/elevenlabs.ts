import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export const elevenlabs = new ElevenLabsClient();

export const ARENA_VOICEOVER_SCRIPT = [
  {
    id: "hook",
    startFrame: 4,
    text: "Desafio no WhatsApp? Acabou.",
  },
  {
    id: "logo",
    startFrame: 71,
    text: "Apresentamos o Arena Fit Pró.",
  },
  {
    id: "camera",
    startFrame: 138,
    text: "Câmera antifraude ao vivo, sem fotos da galeria.",
  },
  {
    id: "leaderboard",
    startFrame: 246,
    text: "Ranking em tempo real que engaja seus alunos.",
  },
  {
    id: "finance",
    startFrame: 354,
    text: "E saque via Pix na hora, com taxa zero no plano Pró.",
  },
  {
    id: "final",
    startFrame: 462,
    text: "Crie o seu desafio hoje no Arena Fit Pró.",
  },
] as const;

async function streamToBuffer(
  stream: ReadableStream<Uint8Array>
): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Buffer[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

export async function synthesizeVoiceover(
  text: string,
  voiceId = "CwhRBWXzGAHq8TQ4Fs17" // Roger — descontraído, informal e impactante
): Promise<Buffer> {
  const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
    text,
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
    voiceSettings: {
      stability: 0.45,
      similarityBoost: 0.85,
      style: 0.35,
      useSpeakerBoost: true,
    },
  });

  return streamToBuffer(audioStream);
}

export async function synthesizeSoundEffect(
  prompt: string,
  durationSeconds = 1.5
): Promise<Buffer> {
  const audioStream = await elevenlabs.textToSoundEffects.convert({
    text: prompt,
    durationSeconds,
    promptInfluence: 0.4,
  });

  return streamToBuffer(audioStream);
}
