import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Şu anki zamanı al
  const now = new Date();

  // Dakika eşleşmesi yapan kayıtları getir
  const result = await sql`
    SELECT * FROM reminders
    WHERE run_at <= NOW()
      AND sent = false
  `;

  const reminders = result.rows;

  for (const reminder of reminders) {
    // Farcaster Notification API’ye gönderilecek payload
    await fetch('https://api.farcaster.xyz/v2/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': process.env.FARCASTER_API_KEY
      },
      body: JSON.stringify({
        recipientFid: reminder.fid,
        title: "⏰ Wake up!",
        body: `Your reminder: ${reminder.text}`
      })
    });

    // Gönderildi olarak işaretle
    await sql`
      UPDATE reminders
      SET sent = true
      WHERE id = ${reminder.id}
    `;
  }

  return res.json({ sent: reminders.length });
}

