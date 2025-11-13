// pages/api/webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// Demo: kalıcı DB yerine in-memory obje.
// Gerçekte bunu KV/DB'ye yazman gerekecek.
const MEMORY: Record<number, { granted: boolean }> = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Sadece POST kabul edelim
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Base Mini Apps docs: bu 3 header ile çağrı doğrulanır
  const assocHeader = req.headers[
    'x-base-miniapp-account-association'
  ] as string | undefined;

  const assocPayload = req.headers[
    'x-base-miniapp-account-association-payload'
  ] as string | undefined;

  const assocSignature = req.headers[
    'x-base-miniapp-account-association-signature'
  ] as string | undefined;

  // Üretimde: assocHeader/payload/signature doğrula
  // (docs'taki /api/pay örneğindekiyle aynı yöntem).
  if (!assocHeader || !assocPayload || !assocSignature) {
    return res.status(401).end('missing verification headers');
  }

  // event = { type, data, fid, ... }
  const event = req.body as { type?: string; fid?: number; data?: any };

  // Örnek: { type: 'notifications.granted', fid: 12345 }
  if (event?.type === 'notifications.granted' && typeof event.fid === 'number') {
    MEMORY[event.fid] = { granted: true };
    console.log('Notification permission granted for fid', event.fid);
  }

  return res.status(200).json({ ok: true });
}
