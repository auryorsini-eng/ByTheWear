/**
 * Proxy SerpApi search.json. Richiede SERPAPI_KEY nelle variabili d'ambiente Vercel.
 * Non accetta api_key dal client: viene impostata solo lato server.
 */
module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "SERPAPI_KEY non configurata sul server" });
  }

  const params = new URLSearchParams();
  const q = req.query || {};

  for (const [key, value] of Object.entries(q)) {
    if (key === "api_key") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, String(v)));
    } else if (value != null && value !== "") {
      params.append(key, String(value));
    }
  }

  params.set("api_key", apiKey);

  const upstream = await fetch("https://serpapi.com/search.json?" + params.toString());
  const text = await upstream.text();
  const ct = upstream.headers.get("content-type") || "application/json";
  res.status(upstream.status).setHeader("Content-Type", ct);
  return res.send(text);
};
