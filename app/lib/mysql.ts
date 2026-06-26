// Shared MySQL connection pool for the hosted database (GoDaddy auto-injects
// DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD). Used by photo storage and the
// deposits log. When these vars are absent (local/Render) callers fall back to
// their non-DB path.

import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function dbConfigured(): boolean {
  return Boolean(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME);
}

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 4,
      maxIdle: 2,
      idleTimeout: 30_000,
      // TLS off by default (GoDaddy's snippet uses none). When DB_SSL=true we
      // VERIFY the server cert (supply the provider CA via DB_SSL_CA); only an
      // explicit DB_SSL_INSECURE=true disables verification.
      ...(process.env.DB_SSL === "true"
        ? {
            ssl: {
              rejectUnauthorized: process.env.DB_SSL_INSECURE !== "true",
              ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : {}),
            },
          }
        : {}),
    });
  }
  return pool;
}
