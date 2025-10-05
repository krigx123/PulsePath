const express = require("express");
const cors = require("cors");
const compression = require("compression");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Middleware
app.use(compression()); // Enable gzip compression
app.use(cors());
app.use(express.json());

// Serve static files from React build (for production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));
}

// Database setup with connection pooling
const DB_PATH = path.join(__dirname, "stress_agent.db");
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database");
    // Enable WAL mode for better performance
    db.run("PRAGMA journal_mode = WAL");
    db.run("PRAGMA synchronous = NORMAL");
    db.run("PRAGMA cache_size = 1000");
    db.run("PRAGMA temp_store = memory");
  }
});

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS stress_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      timestamp INTEGER,
      date TEXT,
      mood INTEGER,
      tag TEXT,
      note TEXT,
      sleep_hours REAL,
      work_hours REAL,
      heart_rate INTEGER
    )
  `);
});

// API Routes

// Submit stress log
app.post("/api/stress-log", (req, res) => {
  const { user_id, mood, tag, note, sleep_hours, work_hours, heart_rate } = req.body;

  const id = uuidv4();
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date().toISOString().split("T")[0];

  db.run(
    `INSERT INTO stress_logs (id, user_id, timestamp, date, mood, tag, note, sleep_hours, work_hours, heart_rate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, user_id, timestamp, date, mood, tag, note, sleep_hours, work_hours, heart_rate],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Generate suggestions based on the data
      const suggestions = generateSuggestions(mood, sleep_hours, work_hours);

      res.json({
        id,
        suggestions,
        message: "Stress log saved successfully",
      });
    }
  );
});

// Get recent stress logs
app.get("/api/stress-logs/:userId", (req, res) => {
  const { userId } = req.params;
  const limit = req.query.limit || 30;
  const cacheKey = `stress-logs-${userId}-${limit}`;

  // Check cache first
  const cached = getFromCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  db.all(`SELECT * FROM stress_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?`, [userId, limit], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    setCache(cacheKey, rows);
    res.json(rows);
  });
});

// Get stress analytics
app.get("/api/stress-analytics/:userId", (req, res) => {
  const { userId } = req.params;
  const cacheKey = `analytics-${userId}`;

  // Check cache first
  const cached = getFromCache(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  db.all(
    `SELECT mood, timestamp, sleep_hours, work_hours, tag 
     FROM stress_logs 
     WHERE user_id = ? 
     ORDER BY timestamp DESC 
     LIMIT 14`,
    [userId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Calculate analytics
      const analytics = {
        averageMood: rows.length > 0 ? (rows.reduce((sum, row) => sum + row.mood, 0) / rows.length).toFixed(1) : 0,
        averageSleep: rows.length > 0 ? (rows.reduce((sum, row) => sum + (row.sleep_hours || 0), 0) / rows.length).toFixed(1) : 0,
        mostCommonTrigger: getMostCommonTrigger(rows),
        trendData: rows.reverse().map((row, index) => ({
          day: index + 1,
          mood: row.mood,
          sleep: row.sleep_hours || 0,
          timestamp: row.timestamp,
        })),
      };

      setCache(cacheKey, analytics);
      res.json(analytics);
    }
  );
});

// Reset database (DELETE endpoint for security)
app.delete("/api/reset-database", (req, res) => {
  db.run("DELETE FROM stress_logs", function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    console.log(`🗑️  Database reset: ${this.changes} records deleted`);
    res.json({
      message: "Database reset successfully",
      deletedRecords: this.changes,
    });
  });
});

// Import shared utilities (if using Node.js modules)
// For now, keeping local functions to maintain compatibility
function generateSuggestions(mood, sleep_hours, work_hours) {
  const suggestions = [];

  if (mood >= 8 || (sleep_hours < 5 && mood >= 6)) {
    suggestions.push("🫁 High stress detected — Try 5-min deep breathing (4-4-4) and a short walk.");
  } else if (mood >= 6) {
    suggestions.push("🧘 Moderate stress — Try a 5–10 min guided meditation or calming music.");
  } else if (mood >= 4) {
    suggestions.push("😌 Mild stress — Consider some light stretching or journaling.");
  } else {
    suggestions.push("✨ Low stress — Great! Consider a 2-min gratitude note to maintain this state.");
  }

  if (sleep_hours < 6) {
    suggestions.push("😴 Sleep is below optimal — Wind down 30 minutes earlier and avoid screens before bed.");
  }

  if (work_hours > 10) {
    suggestions.push("⏰ Long work day detected — Take micro-breaks, try Pomodoro technique (25/5).");
  }

  if (sleep_hours >= 8 && mood <= 3) {
    suggestions.push("🌟 Good sleep + low stress — Perfect combo! Keep up the healthy routine.");
  }

  return suggestions;
}

function getMostCommonTrigger(rows) {
  if (rows.length === 0) return "None";

  const triggers = {};
  rows.forEach((row) => {
    if (row.tag) {
      triggers[row.tag] = (triggers[row.tag] || 0) + 1;
    }
  });

  return Object.keys(triggers).reduce((a, b) => (triggers[a] > triggers[b] ? a : b), "None");
}

// Serve React app for production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Stress Agent API running on http://localhost:${PORT}`);
});

module.exports = app;
