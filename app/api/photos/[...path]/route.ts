import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { dbConfigured, listPhotos, getPhoto } from "../../../lib/photos-db";

export const runtime = "nodejs";

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), ".uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
};

const TOKEN_RE = /^[a-z0-9-]{1,64}$/;

function esc(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );
}

function galleryHtml(title: string, count: number, tiles: string): string {
  return `<!doctype html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><meta name=robots content="noindex"><title>${title} — Photos</title><style>body{margin:0;background:#111;color:#eee;font-family:system-ui,-apple-system,sans-serif;padding:24px}h1{font-size:15px;font-weight:600;margin:0 0 16px;color:#cbb48a}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}img{width:100%;height:260px;object-fit:cover;border-radius:8px;display:block;background:#222}a{display:block}p{color:#888}</style></head><body><h1>${title} — ${count} photo${count === 1 ? "" : "s"}</h1>${tiles ? `<div class=g>${tiles}</div>` : "<p>No photos found.</p>"}</body></html>`;
}

const htmlHeaders = {
  "Content-Type": "text/html; charset=utf-8",
  "X-Robots-Tag": "noindex",
};

// ── MySQL-backed serving (GoDaddy hosted DB) ────────────────────────────────
// URL scheme: /api/photos/{token} → gallery, /api/photos/{token}/{idx} → image.
async function serveFromDb(segs: string[]): Promise<Response> {
  const token = segs[0];
  if (!token || !TOKEN_RE.test(token)) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Individual image.
  if (segs.length === 2 && /^\d+$/.test(segs[1])) {
    let photo;
    try {
      photo = await getPhoto(token, Number(segs[1]));
    } catch (err) {
      console.error("[photos] db read failed", err);
      return new NextResponse("Not found", { status: 404 });
    }
    if (!photo) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(new Uint8Array(photo.bytes), {
      headers: {
        "Content-Type": photo.mime,
        "Cache-Control": "private, max-age=86400",
        "X-Robots-Tag": "noindex",
      },
    });
  }

  // Gallery.
  if (segs.length === 1) {
    let rows;
    try {
      rows = await listPhotos(token);
    } catch (err) {
      console.error("[photos] db list failed", err);
      return new NextResponse("Not found", { status: 404 });
    }
    if (!rows.length) return new NextResponse("Not found", { status: 404 });
    const tiles = rows
      .map((r) => {
        const url = `/api/photos/${token}/${r.idx}`;
        return `<a href="${url}" target="_blank" rel="noopener"><img src="${url}" loading="lazy" alt=""></a>`;
      })
      .join("");
    return new NextResponse(galleryHtml(esc(token), rows.length, tiles), {
      headers: htmlHeaders,
    });
  }

  return new NextResponse("Not found", { status: 404 });
}

// ── Disk-backed serving (Render persistent disk / local dev) ─────────────────
// Resolve request path segments to an absolute path inside UPLOAD_DIR, or null
// if anything looks like a traversal attempt.
function resolveSafe(parts: string[]): string | null {
  if (
    !parts.length ||
    parts.some(
      (p) => !p || p === "." || p === ".." || p.includes("/") || p.includes("\\"),
    )
  ) {
    return null;
  }
  const root = path.resolve(UPLOAD_DIR);
  const target = path.resolve(root, ...parts);
  if (target !== root && !target.startsWith(root + path.sep)) return null;
  return target;
}

async function serveFromDisk(parts: string[]): Promise<Response> {
  const target = resolveSafe(parts);
  if (!target) return new NextResponse("Not found", { status: 404 });

  let stat;
  try {
    stat = await fs.stat(target);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  // Directory → simple gallery page of the images inside.
  if (stat.isDirectory()) {
    const files = (await fs.readdir(target))
      .filter((f) => MIME[path.extname(f).toLowerCase()])
      .sort();
    const dir = parts.map(encodeURIComponent).join("/");
    const tiles = files
      .map((f) => {
        const url = `/api/photos/${dir}/${encodeURIComponent(f)}`;
        return `<a href="${url}" target="_blank" rel="noopener"><img src="${url}" loading="lazy" alt=""></a>`;
      })
      .join("");
    const title = esc(decodeURIComponent(parts.join(" / ")));
    return new NextResponse(galleryHtml(title, files.length, tiles), {
      headers: htmlHeaders,
    });
  }

  // File → stream the image.
  const ext = path.extname(target).toLowerCase();
  if (!MIME[ext]) return new NextResponse("Not found", { status: 404 });
  const data = await fs.readFile(target);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": MIME[ext],
      "Cache-Control": "private, max-age=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;
  const segs = parts || [];
  return dbConfigured() ? serveFromDb(segs) : serveFromDisk(segs);
}
