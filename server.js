// Next Step server: serves the built app and a secure AI endpoint.
// The Anthropic key lives ONLY in the ANTHROPIC_API_KEY environment variable.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";
const KEY = process.env.ANTHROPIC_API_KEY || "";

app.use(express.json({ limit: "64kb" }));

// Tiny in-memory rate limit: 30 requests / 5 min per IP
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 5 * 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 30;
}

const SYSTEM = `You are Next Step, the friendly AI money coach inside the "Next Step" financial-literacy web app (tagline: "See tomorrow before you spend today").

Your job: explain money concepts and the user's SIMULATION RESULTS in plain, warm language that a grandparent or a first-time investor would understand.

Rules you must follow:
- Use ONLY the numbers given in the SIMULATION CONTEXT. Never invent, recompute, or guess figures, tax rules, or limits. If a number isn't in the context, explain the idea without a number.
- These are hypothetical, educational estimates. Never promise returns. Mention uncertainty briefly when talking about investments.
- Educational information only — not personalized financial, tax, legal, or investment advice. Never tell the user to buy a specific product. If asked "what should I do", explain the tradeoffs and suggest talking to a licensed professional for personal decisions.
- Never ask for or encourage sharing bank passwords, account numbers, SSNs, or other sensitive info.
- Match the user's comfort level: Beginner = no jargon, use an everyday analogy. Intermediate = light terms, defined. Advanced = precise terms OK.
- Be brief: 3-6 short sentences or a few bullet points. Lead with the single most important insight. Bold at most one key phrase using **double asterisks**.
- End with one short, curious follow-up idea the user could try in the simulator (start it with "Try:").`;

app.get("/api/health", (_req, res) => res.json({ ok: true, ai: Boolean(KEY), model: MODEL }));

app.post("/api/ripple", async (req, res) => {
  if (!KEY) return res.status(503).json({ error: "ai_not_configured" });
  if (limited(req.ip)) return res.status(429).json({ error: "rate_limited" });

  const { question = "", context = {}, profile = {}, history = [] } = req.body || {};
  const q = String(question).slice(0, 800);
  if (!q.trim()) return res.status(400).json({ error: "empty_question" });

  const ctx = JSON.stringify(context).slice(0, 6000);
  const prof = JSON.stringify(profile).slice(0, 1000);
  const past = (Array.isArray(history) ? history : [])
    .slice(-6)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
    .map((m) => ({ role: m.role, content: m.text.slice(0, 1500) }));
  // Messages must start with a user turn
  while (past.length && past[0].role !== "user") past.shift();

  const messages = [
    ...past,
    { role: "user", content: `USER PROFILE (hypothetical, self-reported): ${prof}\n\nSIMULATION CONTEXT (computed by the app's deterministic calculators): ${ctx}\n\nQUESTION: ${q}` },
  ];

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: ctrl.signal,
      headers: { "content-type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 900, thinking: { type: "disabled" }, system: SYSTEM, messages }),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error("Anthropic error", r.status, data?.error?.message);
      return res.status(502).json({ error: "ai_error" });
    }
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    if (!text) {
      console.error("Empty AI answer", data.stop_reason, JSON.stringify(data.content || []).slice(0, 300));
      return res.status(502).json({ error: "ai_empty" });
    }
    res.json({ answer: text, source: "ai" });
  } catch (e) {
    console.error("AI request failed", e?.name);
    res.status(504).json({ error: "ai_timeout" });
  } finally {
    clearTimeout(timer);
  }
});

const dist = path.join(__dirname, "dist");
app.use(express.static(dist, { maxAge: "1h", index: false }));
app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));

app.listen(PORT, () => console.log(`Next Step running on :${PORT} (AI ${KEY ? "on" : "fallback mode"}, model ${MODEL})`));
