import OpenAI from "openai";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "OPENAI_API_KEY belum terpasang di Vercel." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const text = String(body.text || "").trim().slice(0, 4000);
    if (!text) return res.status(400).json({ error: "Teks kosong." });

    const client = new OpenAI({ apiKey });
    const audio = await client.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: process.env.OPENAI_TTS_VOICE || "coral",
      input: text
    });

    const buffer = Buffer.from(await audio.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("TTS FUNCTION ERROR", error);
    return res.status(500).json({ error: error?.message || "Terjadi kesalahan saat membuat VN." });
  }
}
