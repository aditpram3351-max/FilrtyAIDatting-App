import OpenAI from "openai";

const MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-5.6-luna";

function jsonError(res, status, message, extra = {}) {
  return res.status(status).json({ success: false, error: message, ...extra });
}

function normalizeCharacter(character) {
  if (!character || typeof character !== "object") return null;
  const age = Number(character.age);
  if (!Number.isFinite(age) || age < 18) return null;
  return {
    name: String(character.name || "Luna").slice(0, 80),
    age,
    personality: String(character.personality || "hangat, playful, caring").slice(0, 1200),
    style: String(character.style || "Bahasa Indonesia santai dan natural").slice(0, 1200),
    appearance: String(character.appearance || "karakter dewasa fiktif").slice(0, 1500),
    background: String(character.background || "").slice(0, 1500)
  };
}

function buildInstructions(c) {
  return `
Kamu adalah ${c.name}, karakter AI virtual yang SEPENUHNYA FIKTIF dan sudah dewasa (${c.age} tahun) dalam aplikasi FlirtyAI.

PERSONALITY:
${c.personality}

GAYA BICARA:
${c.style}

VISUAL PROFILE:
${c.appearance}

BACKGROUND:
${c.background}

ATURAN KARAKTER:
- Pertahankan identitas dan sifat karakter secara konsisten.
- Gunakan bahasa yang sama dengan pengguna. Jika pengguna memakai Bahasa Indonesia, gunakan Bahasa Indonesia.
- Bersikap hangat, natural, responsif, dan tidak kaku.
- Jangan mengaku sebagai manusia nyata dan jangan meniru identitas orang nyata.
- Jangan membahas API, server, Vercel, kode, atau implementasi teknis kecuali pengguna memang bertanya tentangnya.
- Hindari jawaban yang berulang.
- Karakter adalah fiktif dan 18+.
`;
}

function normalizeMessages(body) {
  const raw = Array.isArray(body?.messages)
    ? body.messages
    : typeof body?.message === "string"
      ? [{ role: "user", content: body.message }]
      : [];

  return raw
    .filter(x => x && typeof x.content === "string")
    .slice(-40)
    .map(x => ({
      role: x.role === "assistant" ? "assistant" : "user",
      content: x.content.slice(0, 6000)
    }));
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return jsonError(res, 405, "Method Not Allowed");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return jsonError(res, 503, "OPENAI_API_KEY belum terpasang di Vercel.");

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const character = normalizeCharacter(body.character);
    if (!character) return jsonError(res, 400, "Karakter harus fiktif dan berusia 18+.");

    const messages = normalizeMessages(body);
    if (!messages.length) return jsonError(res, 400, "Pesan kosong.");

    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: MODEL,
      reasoning: { effort: "low" },
      instructions: buildInstructions(character),
      input: messages
    });

    const reply = String(response.output_text || "").trim();
    if (!reply) return jsonError(res, 502, "AI tidak menghasilkan jawaban.");

    return res.status(200).json({ success: true, reply, text: reply });
  } catch (error) {
    console.error("CHAT FUNCTION ERROR", error);
    return jsonError(res, 500, error?.message || "Terjadi kesalahan pada layanan AI.");
  }
}
