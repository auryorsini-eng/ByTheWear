/**
 * Proxy Groq Chat Completions. Richiede GROQ_API_KEY nelle variabili d'ambiente Vercel.
 */

async function readJsonBody(req) {
  if (Buffer.isBuffer(req.body)) {
    return JSON.parse(req.body.toString("utf8") || "{}");
  }
  if (req.body != null && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(raw || "{}");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY non configurata sul server" });
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch {
    return res.status(400).json({ error: "Body JSON non valido" });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return res.status(400).json({ error: "Il body deve essere un oggetto JSON" });
  }

  const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  const text = await upstream.text();
  const ct = upstream.headers.get("content-type") || "application/json";
  res.status(upstream.status).setHeader("Content-Type", ct);
  return res.send(text);
};
