const API = process.env.TELEGRAM_API_BASE || "https://api.telegram.org";

const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const now = () => new Date().toLocaleString("en-GB", { timeZone: "Asia/Tashkent" });

function configured() {
  return !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

async function send(text) {
  const r = await fetch(`${API}/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, parse_mode: "HTML" }),
    signal: AbortSignal.timeout(10000)
  });
  if (!r.ok) throw new Error(`Telegram ${r.status}: ${await r.text()}`);
}

function ip(req) {
  return (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").toString().split(",")[0].trim();
}

module.exports = { esc, now, configured, send, ip };
