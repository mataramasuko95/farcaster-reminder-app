// Farcaster notification service (mock for prototype)
// sendNotfcaton(fid, text): logs and returns sample JSON
//
// Real integration notes:
// - Obtain a Farcaster signer (e.g., via Neynar developer portal) and an API key/token.
// - Common approach: Use Neynar API to publish a cast on behalf of a signer.
//   Docs: https://docs.neynar.com/ (publish cast)
//   Example endpoint: POST https://api.neynar.com/v2/farcaster/cast
//   Headers: { "api_key": NEYNAR_API_KEY, "Content-Type": "application/json" }
//   Body: { signer_uuid, text, channel_id? }
// - Alternatively, Warpcast or direct Hub interactions may be used depending on auth model.
// - Store tokens and signer secrets in environment variables (see .env.example).

async function sendNotfcaton(fid, text) {
  const payload = {
    ok: true,
    provider: 'mock-farcaster',
    fid,
    text,
    at: new Date().toISOString(),
  };
  // Prototype: only log
  console.log('[FarcasterMock] sendNotfcaton ->', payload);
  // In production, perform an authenticated POST to Neynar (or other) API here.
  return payload;
}

module.exports = { sendNotfcaton };
