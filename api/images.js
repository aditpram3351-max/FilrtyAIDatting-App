import OpenAI from "openai";

function jsonError(res, status, message) {
  return res.status(status).json({ success: false, error: message });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return jsonError(res, 405, "Method Not Allowed");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return jsonError(res, 503, "OPENAI_API_KEY belum terpasang di Vercel.");

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const character = body.character || {};
    const age = Number(character.age);
    if (!Number.isFinite(age) || age < 18) return jsonError(res, 400, "Karakter harus berusia 18+.");

    const context = String(body.context || "casual selfie di coffee shop").slice(0, 1200);
    const prompt = `
Create a completely fictional adult character, age ${age}, who is not a real person.

Visual identity:
${String(character.appearance || "adult fictional character").slice(0, 1800)}

Scene:
${context}

Keep the visual identity consistent: face, hairstyle, hair color, eye color, body proportions and overall style. Use a natural photographic aesthetic and everyday non-explicit clothing. Do not depict a real person or a public figure.
`;

    const client = new OpenAI({ apiKey });
    const response = await client.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
      prompt,
      size: "1024x1024"
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) return jsonError(res, 502, "Image API tidak mengembalikan gambar.");

    return res.status(200).json({
      success: true,
      image: `data:image/png;base64,${b64}`
    });
  } catch (error) {
    console.error("IMAGE FUNCTION ERROR", error);
    return jsonError(res, 500, error?.message || "Terjadi kesalahan saat membuat gambar.");
  }
}
