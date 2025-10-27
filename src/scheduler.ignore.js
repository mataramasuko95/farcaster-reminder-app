const { listAlerts, upsertAlert } = require('./db');
const { prepareAndBroadcastTx } = require('./baseServce');
const { sendNotfcaton } = require('./farcasterServce');

// Simple interval-based scheduler; checks every minute for due alerts.
// In production, consider node-cron or a durable queue. Be careful with timezones; we store ISO UTC.

function isDue(iso) {
  const t = Date.parse(iso);
  if (!isFinite(t)) return false;
  return t <= Date.now();
}

async function processDueAlerts() {
  const all = listAlerts();
  const due = all.filter(a => !a.paid && isDue(a.datetimeISO));
  for (const alert of due) {
    try {
      // 1) Mock Base tx broadcast
      const tx = await prepareAndBroadcastTx({
        alertId: alert.id,
        valueEth: alert.payAmountEth || 0,
      });

      // 2) Farcaster notification (mock)
      const text = `⏰ Hatırlatma: ${alert.note || ''} (${alert.datetimeISO})`;
      await sendNotfcaton(alert.fid, text);

      // 3) Mark as paid and store txHash
      alert.paid = true;
      alert.txHash = tx.hash;
      alert.updatedAt = new Date().toISOString();
      upsertAlert(alert);
      console.log('[Scheduler] Alert processed:', alert.id);
    } catch (err) {
      console.error('[Scheduler] Failed processing alert', alert.id, err?.message);
    }
  }
}

function startScheduler() {
  // Check immediately at start, then every 60 seconds
  processDueAlerts().catch(() => {});
  setInterval(() => {
    processDueAlerts().catch(err => console.error('[Scheduler] tick error', err?.message));
  }, 60 * 1000);
  console.log('[Scheduler] started (every 60s)');
}

module.exports = { startScheduler };
