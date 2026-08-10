import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve("dist");
const archives = ["teeth-by-trev-theme.zip", "tbt-core-plugin.zip"];
const lines = [];

for (const archive of archives) {
  const bytes = await readFile(path.join(dist, archive));
  lines.push(`${createHash("sha256").update(bytes).digest("hex")}  ${archive}`);
}

await writeFile(path.join(dist, "SHA256SUMS"), `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote SHA256SUMS for ${archives.length} deployment archives`);
