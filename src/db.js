const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

function ensureDbFile() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { alerts: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
  }
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function upsertAlert(alert) {
  const db = readDb();
  const idx = db.alerts.findIndex(a => a.id === alert.id);
  if (idx === -1) {
    db.alerts.push(alert);
  } else {
    db.alerts[idx] = alert;
  }
  writeDb(db);
  return alert;
}

function getAlert(id) {
  const db = readDb();
  return db.alerts.find(a => a.id === id) || null;
}

function listAlerts() {
  const db = readDb();
  return db.alerts.slice();
}

module.exports = {
  DB_FILE,
  readDb,
  writeDb,
  upsertAlert,
  getAlert,
  listAlerts,
};
