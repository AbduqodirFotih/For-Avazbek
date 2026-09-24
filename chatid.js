// Ishlatish: avval botga Telegramda /start yozing, keyin: node chatid.js
const fs = require("fs");
const path = require("path");
const https = require("https");

try {
  for (const line of fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) { console.log(".env faylida TELEGRAM_BOT_TOKEN ni to'ldiring."); process.exit(1); }

https.get(`https://api.telegram.org/bot${token}/getUpdates`, res => {
  let d = "";
  res.on("data", c => (d += c));
  res.on("end", () => {
    const j = JSON.parse(d);
    if (!j.ok) { console.log("Xato:", j.description); return; }
    const seen = new Map();
    for (const u of j.result) {
      const c = (u.message || u.channel_post || {}).chat;
      if (c) seen.set(c.id, c.title || [c.first_name, c.last_name].filter(Boolean).join(" ") || c.username);
    }
    if (!seen.size) return console.log("Hech narsa topilmadi. Botga Telegramda /start yozib, qayta urinib ko'ring.");
    for (const [id, name] of seen) console.log(`chat_id: ${id}   (${name})`);
  });
}).on("error", e => console.log("Xato:", e.message));
