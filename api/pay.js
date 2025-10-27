module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Only POST allowed. Send JSON body.",
    });
  }

  try {
    const { fid, note, remindAt } = req.body || {};

    // Basit doğrulama
    if (!fid || !note || !remindAt) {
      return res.status(400).json({
        ok: false,
        error: "fid, note ve remindAt zorunlu.",
        exampleBody: {
          fid: 1234,
          note: "Yarın 10:00'da X kişisine ödeme hatırlat",
          remindAt: "2025-10-28T10:30"
        },
      });
    }

    // Burada:
    // - note'u DB'ye yazabiliriz
    // - remindAt zamanına göre bir "hatırlatma job'u" planlayabiliriz
    // - ödeme taslağı (unsignedTx vs) hazırlayabiliriz (şimdilik opsiyonel)

    // DEMO: Sahte taslak veri hazırlayalım, ama kullanıcıya göstermiyoruz.
    const unsignedTx = {
      to: "0xABC01234567890abcdef1234567890ABCDEF12",
      valueEth: "0.00001667",
      data: "0x"
    };

    return res.status(200).json({
      ok: true,
      fid,
      note,
      remindAt,
      message: "Not oluşturuldu ve zamanlandı (taslak).",
      internal: {
        unsignedTx,
        info: "Henüz zincire gönderilmedi."
      }
    });
  } catch (err) {
    console.error("pay handler error:", err);
    return res.status(500).json({
      ok: false,
      error: "Beklenmeyen bir hata oluştu.",
    });
  }
};
