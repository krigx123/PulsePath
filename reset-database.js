// reset-database.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(__dirname, "stress_agent.db");

console.log("🗑️  Resetting database...");

const db = new sqlite3.Database(DB_PATH);

db.run("DELETE FROM stress_logs", function (err) {
  if (err) {
    console.error("❌ Error resetting database:", err.message);
  } else {
    console.log(`✅ Database reset successfully! Deleted ${this.changes} records.`);
  }

  db.close((err) => {
    if (err) {
      console.error("❌ Error closing database:", err.message);
    } else {
      console.log("📦 Database connection closed.");
    }
    process.exit(0);
  });
});
