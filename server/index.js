const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// MySQL Connection Setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Change if needed
  database: 'personality-lock'
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
    return;
  }
  console.log('✅ MySQL connected');
});

// Endpoint: Generate Deterministic User ID
app.post('/generate-id', (req, res) => {
  const { name, dob, color, number } = req.body;
  const rawData = `${name}|${dob}|${color}|${number}`;
  const hash = crypto.createHash('sha256').update(rawData).digest('hex').substring(0, 12);
  console.log('🆔 Generated userId:', hash);
  res.json({ userId: hash });
});

// Endpoint: Get Result by User ID
app.get('/result', (req, res) => {
  const { userId } = req.query;

  db.query('SELECT personality FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) {
      console.error('❌ Error fetching result:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length > 0) {
      res.json({ personality: result[0].personality });
    } else {
      res.status(404).json({ message: 'Not Found' });
    }
  });
});

// Endpoint: Store Result for New User
app.post('/result', (req, res) => {
  const { id, name, dob, color, number } = req.body;

  const personalities = ['Explorer', 'Thinker', 'Leader', 'Dreamer', 'Visionary', 'Guardian'];
  const assignedPersonality = personalities[Math.floor(Math.random() * personalities.length)];

  const sql = 'INSERT INTO users (id, name, dob, color, number, personality) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [id, name, dob, color, number, assignedPersonality];

  db.query(sql, values, (err) => {
    if (err) {
      console.error('❌ Error inserting result:', err);
      return res.status(500).json({ error: 'Insert Failed' });
    }

    res.json({ personality: assignedPersonality });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
