export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { q } = req.query;

  const response = await fetch(
    `https://serpapi.com/search.json?q=${encodeURIComponent(q)}&api_key=${process.env.SERPAPI_KEY}`
  );

  const data = await response.json();
  return res.status(response.status).json(data);
}
