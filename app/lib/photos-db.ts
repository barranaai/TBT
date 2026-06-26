// MySQL-backed storage for inquiry photos.
//
// On GoDaddy Airo the app filesystem is ephemeral (wiped on every redeploy), so
// uploaded photos can't live on disk. We store each photo's bytes as a row
// keyed by a per-lead token and serve them back from /api/photos/{token}. When
// the DB isn't configured (local dev, Render) callers fall back to disk — see
// app/api/inquiry & app/api/photos.

import { dbConfigured, getPool } from "./mysql";

export { dbConfigured };

let schemaReady: Promise<void> | null = null;

// Create the table on first use so there's no manual "Import SQL" step. Retried
// on the next request if it fails (e.g. transient connection issue).
async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS lead_photos (
           id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
           token VARCHAR(64) NOT NULL,
           idx INT NOT NULL,
           filename VARCHAR(190) NULL,
           mime VARCHAR(64) NOT NULL,
           bytes LONGBLOB NOT NULL,
           created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
           INDEX idx_token (token)
         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      )
      .then(() => undefined)
      .catch((e) => {
        schemaReady = null;
        throw e;
      });
  }
  return schemaReady;
}

export type PhotoMeta = { idx: number; filename: string | null; mime: string };
export type PhotoIn = {
  idx: number;
  filename: string | null;
  mime: string;
  bytes: Buffer;
};

// Insert each photo; a single oversized/failed row never blocks the others.
export async function savePhotos(token: string, photos: PhotoIn[]): Promise<number> {
  if (!photos.length) return 0;
  await ensureSchema();
  const p = getPool();
  let written = 0;
  for (const photo of photos) {
    try {
      await p.execute(
        "INSERT INTO lead_photos (token, idx, filename, mime, bytes) VALUES (?, ?, ?, ?, ?)",
        [token, photo.idx, photo.filename, photo.mime, photo.bytes],
      );
      written += 1;
    } catch (err) {
      console.error("[photos-db] insert failed (idx", photo.idx, ")", err);
    }
  }
  return written;
}

export async function listPhotos(token: string): Promise<PhotoMeta[]> {
  await ensureSchema();
  const [rows] = await getPool().query(
    "SELECT idx, filename, mime FROM lead_photos WHERE token = ? ORDER BY idx",
    [token],
  );
  return rows as PhotoMeta[];
}

export async function getPhoto(
  token: string,
  idx: number,
): Promise<{ mime: string; bytes: Buffer } | null> {
  await ensureSchema();
  const [rows] = await getPool().query(
    "SELECT mime, bytes FROM lead_photos WHERE token = ? AND idx = ? LIMIT 1",
    [token, idx],
  );
  const r = (rows as { mime: string; bytes: Buffer }[])[0];
  return r ? { mime: r.mime, bytes: r.bytes } : null;
}
