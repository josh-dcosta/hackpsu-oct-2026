// Next Step server: serves the built app. No AI, no API keys, no user data stored.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const dist = path.join(__dirname, "dist");
app.use(express.static(dist, { maxAge: "1h", index: false }));
app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));

app.listen(PORT, () => console.log(`Next Step running on :${PORT}`));
