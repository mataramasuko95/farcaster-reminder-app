// /api/webhook.js
export default async function handler(req, res) {
  // Warpcast bildirim sistemi webhook'a POST atar.
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true, message: "Warpcast webhook endpoint is live." });
  }

  try {
    const body = req.body;

    console.log("Webhook received:", body);

    // Warpcast ilk test request gönderdiğinde "challenge" içerir.
    if (body?.challenge) {
      return res.status(200).json({ challenge: body.challenge });
    }

    // Bildirim eventleri burada işlenir
    // ör: notification.sent, subscription.created, vs.
    console.log("Webhook event:", body);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
