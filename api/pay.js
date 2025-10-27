// api/pay.js

// Bu fonksiyon sahte bir USD -> ETH hesaplıyor.
// 1 ETH = 3000 USD varsaydık.
// Gerçekte burayı oracle vs ile güncelleyeceğiz.
function usdToEth(usdAmount) {
  const eth = usdAmount / 3000;
  return eth;
}

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Only POST allowed. Send JSON body.",
    });
  }

  try {
    // Frontend bize bunları yollayacak:
    // noteText: kullanıcının yazdığı hatırlatma
    // remindAtIso: seçtiği tarih-saat (datetime-local'dan geliyor)
    // fid: şimdilik sabit 1234 tutuyoruz
    // usdAmount: ödenecek ücret (sabit 0.05 dolar gibi düşünebiliriz)
    // ethAddress: nereye ödeyeceğiz (bizim cüzdan adresimiz)
    const {
      fid,
      usdAmount,
      ethAddress,
      noteText,
      remindAtIso,
    } = req.body || {};

    // Basit kontrol: hepsi var mı?
    if (
      !fid ||
      !usdAmount ||
      !ethAddress ||
      !noteText ||
      !remindAtIso
    ) {
      return res.status(400).json({
        ok: false,
        error:
          "Missing required fields. Gerekli alanlar: fid, usdAmount, ethAddress, noteText, remindAtIso",
        required: ["fid","usdAmount","ethAddress","noteText","remindAtIso"],
        got: { fid, usdAmount, ethAddress, noteText, remindAtIso }
      });
    }

    // zamanı parse edebiliyor muyuz (geçerli tarih mi)
    const ts = Date.parse(remindAtIso);
    if (Number.isNaN(ts)) {
      return res.status(400).json({
        ok: false,
        error: "remindAtIso geçerli bir tarih değil.",
        example: "2025-10-28T10:30:00Z"
      });
    }

    // Kaç ETH lazım (float)
    const ethNeeded = usdToEth(Number(usdAmount));

    // ETH -> wei string (18 decimal). Farcaster cüzdanına value olarak bunu vereceğiz.
    // Örnek: 0.00001667 ETH -> "16670000000000" wei
    const weiBigInt = BigInt(Math.round(ethNeeded * 1e18));
    const weiString = weiBigInt.toString();

    // Kullanıcı imzalayıp göndereceği tx taslağı:
    // chainId: Base mainnet = 8453
    // to:    ethAddress (biz belirliyoruz)
    // value: wei cinsinden string
    // data:  "0x" (ekstra calldata yok)
    const tx = {
      chainId: 8453,
      to: ethAddress,
      value: weiString,
      data: "0x",
    };

    // Cevap olarak şunu döneriz:
    // - ok: true
    // - reminder: kullanıcının notu ve zamanı (bunu ileride DB'ye kaydedip programlayacağız)
    // - tx: cüzdana gönderilecek işlem (frontend bunu kullanıp farcaster wallet'ı çağıracak)
    return res.status(200).json({
      ok: true,
      reminder: {
        text: noteText,
        when: remindAtIso,
        fid: fid,
      },
      tx,
      note: "Bu tx henüz imzalanmadı/gönderilmedi. Frontend farcaster cüzdanıyla gönderecek."
    });
  } catch (err) {
    console.error("pay error:", err);
    return res.status(500).json({
      ok: false,
      error: "Beklenmeyen bir hata oldu.",
    });
  }
};
