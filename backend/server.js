const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dataDir = path.join(__dirname, '..', 'data');
const files = {
  entries: path.join(dataDir, 'entries.json'),
  subscribers: path.join(dataDir, 'subscribers.json'),
  pot: path.join(dataDir, 'pot.json')
};

const readJson = (file) => JSON.parse(fs.existsSync(file) ? fs.readFileSync(file) : '[]');
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

app.get('/pot', (req, res) => res.json(readJson(files.pot)));
app.get('/entries', (req, res) => res.json(readJson(files.entries)));

app.post('/enter', (req, res) => {
  const { wallet, amount } = req.body;
  if (!wallet || !amount) return res.status(400).json({ error: 'Wallet and amount required' });

  const entries = readJson(files.entries);
  entries.push({ wallet, amount, time: Date.now() });
  writeJson(files.entries, entries);

  const pot = readJson(files.pot);
  pot.total = (pot.total || 0) + amount;
  writeJson(files.pot, pot);

  res.json({ success: true, entriesCount: entries.length });
});

app.post('/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const subscribers = readJson(files.subscribers);
  subscribers.push({ email, time: Date.now() });
  writeJson(files.subscribers, subscribers);

  res.json({ success: true });
});

app.post('/draw', (req, res) => {
  const entries = readJson(files.entries);
  if (!entries.length) return res.json({ success: false, message: 'No entries available' });

  const winner = entries[Math.floor(Math.random() * entries.length)];
  res.json({ success: true, winner });
});

app.use(express.static(path.join(__dirname, '..', 'frontend')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`DOG Moon Pot server running on port ${PORT}`));
