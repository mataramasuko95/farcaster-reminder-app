import fs from "fs";
import path from "path";

export default function handler(req, res) {
  // Sadece GET çalışsın
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  // index.html dosyasını root'tan oku
  const filePath = path.join(process.cwd(), "index.html");

  try {
    const html = fs.readFileSync(filePath, "utf8");

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (err) {
    console.error("index.html okunamadı:", err);
    res
      .status(500)
      .send("Beklenmeyen bir hata oldu (index.html bulunamadı).");
  }
}
