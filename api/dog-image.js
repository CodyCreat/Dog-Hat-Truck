// File: api/dog-image.js
// Static site + Vercel serverless function.
// Returns a fresh AI image as a data URL each request.

const BREEDS = ["corgi", "golden retriever", "french bulldog", "pug", "dalmatian"];
const HATS = ["pizza slice hat", "taco shell hat"];

module.exports = async (req, res) => {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return res.status(500).json({ error: "Missing OPENAI_API_KEY" });

    const breed = BREEDS[Math.floor(Math.random() * BREEDS.length)];
    const hat = HATS[Math.floor(Math.random() * HATS.length)];
    const prompt =
      `Photorealistic portrait of a ${breed} wearing a whimsical ${hat}, ` +
      `studio lighting, shallow depth of field, front-facing, high detail, ` +
      `pet-safe accessory on head, joyful, 1:1 aspect ratio`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "512x512",
        response_format: "b64_json"
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI error:", text);
      return res.status(500).json({ error: "image_failed" });
    }

    const data = await response.json();
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) return res.status(500).json({ error: "no_image" });

    res.json({ url: `data:image/png;base64,${b64}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
};
