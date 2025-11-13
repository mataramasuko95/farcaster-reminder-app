export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  const now = new Date();

  const dueReminders = await getDueRemindersFromDb(now); 
  // SELECT * FROM reminders WHERE sent = false AND fireAt <= now

  for (const r of dueReminders) {
    try {
      await sendMiniAppNotification({
        fid: r.fid,
        appFid: 309857, // Base app FID (docs’ta yazıyor)
        title: "⏰ Reminder",
        body: r.note,
      });

      await markReminderAsSent(r.id);
    } catch (e) {
      console.error("Failed to send reminder notification", e);
    }
  }

  return res.status(200).json({ ok: true, processed: dueReminders.length });
}
