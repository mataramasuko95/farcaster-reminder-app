// /api/schedule.js
import { kv } from '@vercel/kv'; // Vercel KV (Upstash) kullanılır

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const { fid, note, whenIso } = await req.json();
  if (!fid || !note || !whenIso) return new Response('Bad request', { status: 400 });

  const t = Date.parse(whenIso);
  if (Number.isNaN(t)) return new Response('Bad date', { status: 400 });

  // due:<unixMinutes> listesine ekle
  const slot = Math.floor(t / 60000); // minute bucket
  const id = crypto.randomUUID();
  await kv.hset(`reminder:${id}`, { fid: String(fid), note, whenIso });
  await kv.sadd(`due:${slot}`, id);

  return new Response(JSON.stringify({ ok: true, id }), { headers: { 'Content-Type': 'application/json' } });
}
