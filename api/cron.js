// /api/cron.js
import { kv } from '@vercel/kv';

export const config = { runtime: 'edge' };

async function sendNotification({ fid, note }) {
  // Farcaster Developer Tools -> API Keys'ten aldığın anahtarı kullan
  const apiKey = process.env.FARCASTER_API_KEY;
  const body = {
    fid: Number(fid),
    title: '⏰ Reminder',
    body: note,
    // kullanıcı bildirime tıklayınca açılacak sayfa:
    targetUrl: 'https://ureminder-app.vercel.app/'
  };

  // Not: endpoint isimleri değişebilir; kendi anahtarınla docs’taki route’u kullan.
  const res = await fetch('https://api.farcaster.xyz/v2/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });
  if (!res.ok) console.error('notify fail', await res.text());
}

export default async function handler() {
  const nowSlot = Math.floor(Date.now() / 60000);
  // son 2-3 dakikayı da süpür (gecikme payı)
  const slots = [nowSlot - 2, nowSlot - 1, nowSlot, nowSlot + 1];

  for (const slot of slots) {
    const ids = await kv.smembers(`due:${slot}`);
    if (!ids?.length) continue;

    for (const id of ids) {
      const data = await kv.hgetall(`reminder:${id}`);
      if (data?.fid && data?.note) {
        await sendNotification({ fid: data.fid, note: data.note });
      }
      // temizle
      await kv.del(`reminder:${id}`);
      await kv.srem(`due:${slot}`, id);
    }
  }

  return new Response('ok');
}
