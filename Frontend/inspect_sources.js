const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'music.db');
console.log('Opening database at:', dbPath);

try {
  const db = new Database(dbPath, { readonly: true });
  const rows = db.prepare('SELECT id, name FROM sources').all();

  console.log('Found sources:', rows.length);
  rows.forEach(row => {
    console.log(`ID: "${row.id}", Name: "${row.name}"`);
    console.log(`ID (hex):`, Buffer.from(row.id).toString('hex'));
  });
} catch (err) {
  console.error('Error reading database:', err);
}
