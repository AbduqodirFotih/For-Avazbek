const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const enabled = !!(URL_ && TOKEN);
const mem = { wishes: [], hits: new Map() };

async function cmd(args) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(args)
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || `redis ${r.status}`);
  return j.result;
}

async function addWish(w) {
  if (!enabled) { mem.wishes.unshift(w); return; }
  await cmd(["LPUSH", "wishes", JSON.stringify(w)]);
  await cmd(["LTRIM", "wishes", 0, 4999]);
}

async function listWishes(n = 300) {
  if (!enabled) return mem.wishes.slice(0, n);
  const rows = await cmd(["LRANGE", "wishes", 0, n - 1]);
  return rows.map(x => { try { return JSON.parse(x); } catch { return null; } }).filter(Boolean);
}

async function tooMany(key, limit, ttlSec) {
  if (!enabled) {
    const now = Date.now();
    const list = (mem.hits.get(key) || []).filter(t => now - t < ttlSec * 1000);
    list.push(now);
    mem.hits.set(key, list);
    return list.length > limit;
  }
  const c = await cmd(["INCR", key]);
  if (c === 1) await cmd(["EXPIRE", key, ttlSec]);
  return c > limit;
}

module.exports = { enabled, addWish, listWishes, tooMany };
