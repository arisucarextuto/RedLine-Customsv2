PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 username TEXT NOT NULL UNIQUE,
 display_name TEXT NOT NULL,
 password_hash TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('admin','staff')),
 active INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS products (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 category TEXT NOT NULL,
 name TEXT NOT NULL,
 price INTEGER NOT NULL,
 pd_ems_half INTEGER NOT NULL DEFAULT 1,
 max_qty INTEGER,
 active INTEGER NOT NULL DEFAULT 1,
 sort_order INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS work_logs (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 staff_user_id INTEGER,
 staff_name_snapshot TEXT NOT NULL,
 customer_type TEXT NOT NULL CHECK(customer_type IN ('general','pd','ems')),
 total INTEGER NOT NULL,
 FOREIGN KEY(staff_user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS work_log_items (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 work_log_id INTEGER NOT NULL,
 product_id INTEGER,
 product_name_snapshot TEXT NOT NULL,
 category_snapshot TEXT NOT NULL,
 quantity INTEGER NOT NULL,
 unit_price INTEGER NOT NULL,
 subtotal INTEGER NOT NULL,
 FOREIGN KEY(work_log_id) REFERENCES work_logs(id) ON DELETE CASCADE,
 FOREIGN KEY(product_id) REFERENCES products(id)
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash TEXT PRIMARY KEY,
 user_id INTEGER NOT NULL,
 csrf_token TEXT NOT NULL,
 expires_at TEXT NOT NULL,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_work_logs_created_at ON work_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_work_logs_staff ON work_logs(staff_user_id);
CREATE INDEX IF NOT EXISTS idx_items_work_log ON work_log_items(work_log_id);
