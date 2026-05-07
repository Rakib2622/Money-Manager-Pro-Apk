import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function initDb() {
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const dbPath = path.join(dataDir, "app.db");
  const db = new Database(dbPath);

  // Enable WAL mode for performance and concurrent access
  db.pragma('journal_mode = WAL');

  // Create transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT,
      date TEXT NOT NULL
    )
  `);

  // Create profile table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT,
      phone TEXT,
      address TEXT,
      notes TEXT
    )
  `);

  // Seed profile if not exists
  const profile = db.prepare("SELECT * FROM user_profile WHERE id = 1").get();
  if (!profile) {
    db.prepare("INSERT INTO user_profile (id, name, phone, address, notes) VALUES (1, '', '', '', '')").run();
  }

  // Migration from JSON if exists and transactions table is empty
  const countRow = db.prepare("SELECT COUNT(*) as count FROM transactions").get() as { count: number };
  const dbPathJson = path.join(__dirname, "expense_tracker.json");
  if (countRow.count === 0 && fs.existsSync(dbPathJson)) {
    try {
      const data = JSON.parse(fs.readFileSync(dbPathJson, "utf-8"));
      const insert = db.prepare("INSERT INTO transactions (type, category, amount, note, date) VALUES (?, ?, ?, ?, ?)");
      const transaction = db.transaction((txs) => {
        for (const tx of txs) {
          insert.run(tx.type, tx.category, tx.amount, tx.note, tx.date);
        }
      });
      transaction(data);
    } catch (e) {
      console.error("Migration failed:", e);
    }
  }

  return db;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // Simple health check - respond immediately
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  let db: any;
  try {
    db = initDb();
    console.log("Database initialized successfully with better-sqlite3");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }

  // API Routes
  
  app.get("/api/transactions", (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not ready" });
      const transactions = db.prepare("SELECT * FROM transactions ORDER BY date DESC").all();
      res.json(transactions);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not ready" });
      const id = parseInt(req.params.id);
      const transaction = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id);
      if (transaction) {
        res.json(transaction);
      } else {
        res.status(404).json({ error: "Transaction not found" });
      }
    } catch (e) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.post("/api/transactions", (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not ready" });
      const { type, category, amount, note, date } = req.body;
      const result = db.prepare(
        "INSERT INTO transactions (type, category, amount, note, date) VALUES (?, ?, ?, ?, ?)"
      ).run(type, category, amount, note, date);
      res.json({ id: result.lastInsertRowid, ...req.body });
    } catch (e) {
      res.status(500).json({ error: "Failed to save transaction" });
    }
  });

  app.put("/api/transactions/:id", (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not ready" });
      const id = parseInt(req.params.id);
      const { type, category, amount, note, date } = req.body;
      const result = db.prepare(
        "UPDATE transactions SET type = ?, category = ?, amount = ?, note = ?, date = ? WHERE id = ?"
      ).run(type, category, amount, note, date, id);
      
      if (result.changes > 0) {
        res.json({ updated: 1 });
      } else {
        res.status(404).json({ error: "Transaction not found" });
      }
    } catch (e) {
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not ready" });
      const id = parseInt(req.params.id);
      const result = db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
      
      if (result.changes > 0) {
        res.json({ deleted: 1 });
      } else {
        res.status(404).json({ error: "Transaction not found" });
      }
    } catch (e) {
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  app.get("/api/profile", (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not ready" });
      const profile = db.prepare("SELECT * FROM user_profile WHERE id = 1").get();
      res.json(profile);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not ready" });
      const { name, phone, address, notes } = req.body;
      db.prepare(
        "UPDATE user_profile SET name = ?, phone = ?, address = ?, notes = ? WHERE id = 1"
      ).run(name, phone, address, notes);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.get("/api/report/summary", (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "Database not ready" });
      const report = db.prepare(`
        SELECT 
          strftime('%Y-%m', date) as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions
        WHERE date >= date('now', '-3 month')
        GROUP BY month
        ORDER BY month DESC
        LIMIT 3
      `).all();
      res.json(report);
    } catch (e) {
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    app.get("*", async (req, res, next) => {
      // Exclude API routes from SPA fallback
      if (req.originalUrl.startsWith("/api")) return next();
      
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

