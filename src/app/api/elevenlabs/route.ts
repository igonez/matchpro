import { NextResponse } from "next/server";
import { ARENA_VOICEOVER_SCRIPT, synthesizeVoiceover } from "@/lib/elevenlabs";
import { createClient } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    // 1. Rate limiting estrito para proteção de créditos da ElevenLabs
    const rateLimitResponse = enforceRateLimit(request, "ai");
    if (rateLimitResponse) return rateLimitResponse;

    // 2. Autenticação obrigatória para evitar uso público não autorizado
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado. Autenticação obrigatória." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const text =
      typeof body.text === "string" && body.text.trim().length > 0
        ? body.text.trim().slice(0, 1000)
        : ARENA_VOICEOVER_SCRIPT.map((s) => s.text).join(" ");
    const voiceId =
      typeof body.voiceId === "string" && body.voiceId.trim().length > 0
        ? body.voiceId.trim()
        : "onwK4e9ZLuTAKqWW03F9";

    const audioBuffer = await synthesizeVoiceover(text, voiceId);

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.byteLength),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao gerar áudio ElevenLabs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
