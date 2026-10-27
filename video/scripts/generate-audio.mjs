import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");
const videoPublicDir = path.resolve(__dirname, "../public");

const envLocalPath = path.join(rootDir, ".env.local");
if (fs.existsSync(envLocalPath) && !process.env.ELEVENLABS_API_KEY) {
  const lines = fs.readFileSync(envLocalPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.+)\s*$/);
    if (match) {
      process.env.ELEVENLABS_API_KEY = match[1].replace(/^['"]|['"]$/g, "");
    }
  }
}

const client = new ElevenLabsClient();

// Voz: Roger — descontraído, informal e impactante
const VOICE_ID = "CwhRBWXzGAHq8TQ4Fs17"; // Roger
const MODEL_ID = "eleven_multilingual_v2";

// Roteiro descontraído, informal e impactante sincronizado com cada cena:
const VOICEOVER_SEGMENTS = [
  {
    file: "vo-hook.mp3",
    // Cena 1 na tela: "DESAFIO NO WHATSAPP? ACABOU."
    text: "Desafio no WhatsApp? Esquece, isso acabou!",
    nextText: "Chegou o Arena Fit Pró.",
  },
  {
    file: "vo-logo.mp3",
    // Cena 2 na tela: "ArenaFitPro — GAMIFICATION OS"
    text: "Chegou o Arena Fit Pró.",
    previousText: "Desafio no WhatsApp? Esquece, isso acabou!",
    nextText: "Câmera antifraude ao vivo, sem foto antiga da galeria.",
  },
  {
    file: "vo-camera.mp3",
    // Cena 3 na tela: "Câmera antifraude ao vivo" + "GALERIA BLOQUEADA" + "580 KCAL"
    text: "Câmera antifraude ao vivo, sem foto antiga da galeria.",
    previousText: "Chegou o Arena Fit Pró.",
    nextText: "Um ranking em tempo real que vicia a galera toda.",
  },
  {
    file: "vo-leaderboard.mp3",
    // Cena 4 na tela: "Ranking ao vivo que vicia a turma" + Pódio #1 #2 #3
    text: "Um ranking em tempo real que vicia a galera toda.",
    previousText: "Câmera antifraude ao vivo, sem foto antiga da galeria.",
    nextText: "E o Pix cai na hora na sua conta, com taxa zero no Pró.",
  },
  {
    file: "vo-finance.mp3",
    // Cena 5 na tela: "SPLIT PIX D+0" + "R$ 4.750,00 na sua conta. 0% de taxa no PRO."
    text: "E o Pix cai na hora na sua conta, com taxa zero no Pró.",
    previousText: "Um ranking em tempo real que vicia a galera toda.",
    nextText: "Bora criar o seu desafio hoje no Arena Fit Pró!",
  },
  {
    file: "vo-final.mp3",
    // Cena 6 na tela: "CRIE SEU DESAFIO -> arenafitpro.com.br"
    text: "Bora criar o seu desafio hoje no Arena Fit Pró!",
    previousText: "E o Pix cai na hora na sua conta, com taxa zero no Pró.",
  },
];

const SFX_SEGMENTS = [
  {
    file: "sfx-whoosh.mp3",
    prompt: "Cinematic deep titanium whoosh transition sound effect, clean modern UI",
    durationSeconds: 1.0,
  },
  {
    file: "sfx-impact.mp3",
    prompt: "Deep sub bass impact hit with subtle metallic shimmer, luxury tech reveal",
    durationSeconds: 1.5,
  },
];

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

// Estima a duração de um MP3 CBR 128kbps (16000 bytes/seg)
function getMp3DurationSec(buffer) {
  return +(buffer.byteLength / 16000).toFixed(2);
}

async function main() {
  fs.mkdirSync(videoPublicDir, { recursive: true });

  const durations = {};

  for (const seg of VOICEOVER_SEGMENTS) {
    console.log(`Gerando locução PT-BR (${MODEL_ID}): ${seg.file} -> "${seg.text}"`);
    const audioStream = await client.textToSpeech.convert(VOICE_ID, {
      text: seg.text,
      modelId: MODEL_ID,
      outputFormat: "mp3_44100_128",
      previousText: seg.previousText,
      nextText: seg.nextText,
      voiceSettings: {
        stability: 0.45,
        similarityBoost: 0.85,
        style: 0.35,
        useSpeakerBoost: true,
      },
    });
    const buffer = await streamToBuffer(audioStream);
    const outPath = path.join(videoPublicDir, seg.file);
    fs.writeFileSync(outPath, buffer);
    durations[seg.file] = getMp3DurationSec(buffer);
    console.log(`  -> salvo (${durations[seg.file]}s)`);
  }

  for (const sfx of SFX_SEGMENTS) {
    const outPath = path.join(videoPublicDir, sfx.file);
    if (!fs.existsSync(outPath)) {
      console.log(`Gerando efeito sonoro: ${sfx.file}...`);
      const sfxStream = await client.textToSoundEffects.convert({
        text: sfx.prompt,
        durationSeconds: sfx.durationSeconds,
        promptInfluence: 0.4,
      });
      const buffer = await streamToBuffer(sfxStream);
      fs.writeFileSync(outPath, buffer);
    }
  }

  fs.writeFileSync(
    path.join(videoPublicDir, "audio-manifest.json"),
    JSON.stringify(
      {
        enabled: true,
        model: MODEL_ID,
        durations,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  console.log("Todos os áudios ElevenLabs foram regenerados com sucesso!", durations);
}

main().catch((err) => {
  console.error("Erro ao gerar áudio:", err.message || err);
  process.exit(1);
});
