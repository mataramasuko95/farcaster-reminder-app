const fs = require("fs");
const path = require("path");

module.exports = function handler(req, res) {
  // Sadece GET isteklerine izin veriyoruz
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  // Proje kökünden index.html dosyasını oku
  const filePath = path.join(process.cwd(), "index.html");

  try {
    const html = fs.readFileSync(filePath, "utf8");

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (err) {
    console.error("index.html okunamadı:", err);
    return res
      .status(500)
      .send("Beklenmeyen bir hata oldu (index.html bulunamadı).");
  }
};
