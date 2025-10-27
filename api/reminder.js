// api/reminder.js
// Kullanıcıdan gelen hatırlatma isteğini alır
// Şimdilik DB yok, zincir yok; sadece doğrulayıp geri döndürüyoruz.

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Only POST allowed. Send JSON { note, remindAtISO }"
    });
  }

  try {
    const { note, remindAtISO } = req.body || {};

    if (!note || typeof note !== "string") {
      return res.status(400).json({
        ok: false,
        error: "note zorunlu (string)."
      });
    }

    if (!remindAtISO || typeof remindAtISO !== "string") {
      return res.status(400).json({
        ok: false,
        error: "remindAtISO zorunlu (datetime-local string)."
      });
    }

    // min validation: tarih parse edilebiliyor mu?
    const ts = Date.parse(remindAtISO);
    if (Number.isNaN(ts)) {
      return res.status(400).json({
        ok: false,
        error: "remindAtISO geçerli bir tarih değil."
      });
    }

    // Burada normalde şunları yapabilirsin:
    // - Farcaster tarafında '/alerts' benzeri endpoint'e kaydet
    // - internal DB'ye (cron job okuyacak) push et
    // - vs...

    // Biz şimdilik sadece 'taslak kaydı' gibi geri veriyoruz:
    return res.status(200).json({
      ok: true,
      stored: {
        id: Date.now(),        // fake id
        note,
        remindAtISO,
      },
      message:
        "Taslak hatırlatma alındı. Burada normalde Farcaster'a schedule edebilirsin."
    });
  } catch (err) {
    console.error("reminder handler error:", err);
    return res.status(500).json({
      ok: false,
      error: "Beklenmeyen bir hata oluştu (reminder.js)."
    });
  }
};
