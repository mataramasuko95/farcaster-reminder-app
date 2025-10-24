# Farcaster Mini Reminder App Spec

## Amaç
- Kullanıcı, uygulama içinde UTC olarak bir tarih/saat seçip altına bir açıklama (note) yazar.
- Uygulama, zaman geldiğinde Base ağında (mock) bir işlem işaretler ve Farcaster üzerinden kullanıcıya bir bildirim gönderir (mock).
- Küçük bir mikro-ödeme (ör. 0.05 USD karşılığı ETH) akışı gösterilir; gerçek imzalama/broadcast kullanıcı onayı olmadan yapılmaz.

## Mimari Özet
- API: Express tabanlı Node.js sunucu (`src/index.js`).
- Scheduler: Basit bir `setInterval` ile her 60 saniyede bir tetiklenir (`src/scheduler.js`).
- Veritabanı: Yerel JSON dosyası (`src/db.json`) ve yardımcı modül (`src/db.js`).
- Servisler:
  - Farcaster servisi (mock): `src/farcasterServce.js`
  - Base/ETH servisi (mock + örnekler): `src/baseServce.js`

## Dosya Yapısı
- `src/index.js` — Express API ve endpoint’ler, scheduler başlatma.
- `src/scheduler.js` — Süresi gelen alarmları tetikleme, Base tx (mock) + Farcaster bildirim (mock).
- `src/db.js` — JSON DB yardımcıları (oku/yaz/güncelle).
- `src/db.json` — Persist edilen alarmlar.
- `src/baseServce.js` — `usdToEth`, `prepareAndBroadcastTx` (mock) ve ethers ile gerçek yayın için yorumlar.
- `src/farcasterServce.js` — `sendNotfcaton` (mock) ve Neynar/Farcaster gerçek entegrasyon notları.
- `.env.example` — Gerekli ortam değişkenleri örneği.

## Veri Modeli (Alert)
```
{
  "id": "string",           // hex kısa id
  "fid": 1234,               // Farcaster user id (number)
  "datetimeISO": "ISO-8601",// UTC ISO tarih/saat
  "note": "string",         // kullanıcı notu
  "paid": false,             // scheduler sonrası true olur
  "txHash": null,            // mock tx hash
  "payUsd": 0.05,            // istenen USD ödeme tutarı (opsiyonel)
  "payAmountEth": 0.000012,  // hesaplanan ETH miktarı (opsiyonel)
  "createdAt": "ISO",
  "updatedAt": "ISO"
}
```

## API Uçları
- POST `/alerts`
  - Body: `{ fid:number, datetimeISO:string, note?:string, payUsd?:number }`
  - Doğrulama, DB'ye kaydetme, payUsd varsa `usdToEth` ile `payAmountEth` hesaplama.
  - Response: `{ ok, id, payAmountEth?, instruction }`

- GET `/alerts/:id`
  - Tekil alarm detayını döndürür: `{ ok, alert }`.

- GET `/casts/:fid` (mock)
  - Kullanıcının son cast'lerinden örnek dönülür: `{ ok, casts }`.

- POST `/pay`
  - Body: `{ fd:number, ethAddress:string, usdAmount:number }`
  - `usdAmount` değerini sabit bir kurla (ör: 1 ETH = 3000 USD) ETH'e çevirir ve `ethNeeded` üretir.
  - İmzalanmamış bir işlem JSON'u (`unsignedTx`) oluşturur, zincire göndermez.
  - Basit bir in-memory store'a bir kayıt ekler: `{ fd, usdAmount, ethNeeded, timestamp }`.
  - Response: `{ ok, fd, usdAmount, ethNeeded, unsignedTx }`

## Ödeme / Taahhüt (pay)
- Kullanıcı mini app içinde küçük bir taahhüt (ör: 0.05 USD karşılığı ETH) belirler.
- Bu taahhüt Base ağına yazılacak bir işlem olarak hazırlanır; imzalanmamış işlem JSON'u (`unsignedTx`) üretilir ve zincire gönderilmez.
- İleride bu işlem kullanıcı tarafından imzalanıp zincire konabilir ve Farcaster üzerinde paylaşılabilir.

## Akışlar
1) Alert oluşturma
   - İstemci POST `/alerts` gönderir.
   - Sunucu doğrular, DB’ye yazar, ETH miktarını (mock oranla) hesaplayıp talimat döndürür.

2) Zamanı gelince tetikleme (Scheduler)
   - Her 60 sn’de bir, `paid=false` ve tarihi geçmiş alarmlar bulunur.
   - Önce Base tx (mock) üretilir (`prepareAndBroadcastTx`), hash üretilir.
   - Ardından Farcaster bildirimi (mock) `sendNotfcaton(fid, text)` çağrılır.
   - Kayıt `paid=true`, `txHash=<mock>` olarak güncellenir.

## Base/ETH Entegrasyonu (Gerçek İçin Notlar)
- `ethers v6` ile örnek (koddaki yorumlarda mevcut):
  - `provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL)`
  - `wallet = new ethers.Wallet(PRIVATE_KEY, provider)`
  - `wallet.sendTransaction({ to, value: ethers.parseEther(valueEth), data })`
- Gizli veriler `.env` içerisinden okunmalı; repoya konmamalı.
- Mikro ödeme akışı prototipte sadece hesaplama ve talimat döndürür; gerçek imzalama kullanıcı onayı alındıktan sonra etkinleştirilmeli.

## Fiyatlandırma (usdToEth)
- Örnek olarak CoinGecko Simple Price API kullanılabilir (rate-limit ve politika uyarılarına dikkat). Prototipte 1 ETH = 3000 USD varsayımı ile dönüş yapılır.

## Farcaster Entegrasyonu (Gerçek İçin Notlar)
- Neynar API üzerinden bir signer ile cast yayınlamak tipik yaklaşımdır.
- Örnek uç nokta: `POST https://api.neynar.com/v2/farcaster/cast`
  - Header: `api_key: <NEYNAR_API_KEY>`
  - Body: `{ signer_uuid, text, channel_id? }`
- Token/signer bilgileri `.env` altında tutulmalı.

## Güvenlik Notları
- `.env` içinde: `PRIVATE_KEY`, `BASE_RPC_URL`, `PAYMENT_ADDRESS`, `NEYNAR_API_KEY` vb.
- Gerçek ödeme/tx gönderimi kullanıcı etkileşimi ve onayı olmadan yapılmamalı.
- Girdi doğrulaması ve tarih/saat (UTC) tutarlılığına dikkat.

## Bağımlılıklar
- `express`, `axios`, `ethers`, `node-cron` (opsiyonel; prototipte `setInterval` kullanılıyor).

## Çalıştırma
- `npm start` (PORT varsayılan 3000; meşgulse `PORT=3003` gibi değiştirin).

## Test Örnekleri
- POST /alerts
```
curl -s -X POST http://localhost:3003/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "fid":1234,
    "datetimeISO":"2025-10-25T12:00:00.000Z",
    "note":"Yarın 15:00\'te 100 ETH al",
    "payUsd":0.05
  }'
```
- GET /alerts/:id
```
curl -s http://localhost:3003/alerts/<id>
```
- GET /casts/:fid
```
curl -s http://localhost:3003/casts/1234
```

## Gelecek İyileştirmeler
- Gerçek tx yayınlama ve ödeme doğrulama (receipt, on-chain event).
- Zamanlama için `node-cron` veya bir görev kuyruğu kullanımı.
- Kimlik doğrulama/istenmeyen kullanım koruması.
- Kullanıcıya ödeme akışını kolaylaştıracak bir "pay" endpoint’i ve imzalı tx önerisi.
