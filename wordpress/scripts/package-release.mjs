import { spawnSync } from "node:child_process";
import {
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readdir,
  rename,
  rm,
  stat,
  utimes,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, "dist");
const sourceDateEpoch = Number.parseInt(
  process.env.SOURCE_DATE_EPOCH || "946684800",
  10,
);

if (!Number.isSafeInteger(sourceDateEpoch) || sourceDateEpoch < 315532800) {
  throw new Error("SOURCE_DATE_EPOCH must be a valid ZIP-compatible Unix timestamp");
}

const normalizedDate = new Date(sourceDateEpoch * 1000);
const releases = [
  {
    source: path.join(
      projectRoot,
      "wp-content",
      "themes",
      "teeth-by-trev",
    ),
    rootName: "teeth-by-trev",
    archiveName: "teeth-by-trev-theme.zip",
  },
  {
    source: path.join(projectRoot, "wp-content", "plugins", "tbt-core"),
    rootName: "tbt-core",
    archiveName: "tbt-core-plugin.zip",
  },
];

async function normalizeTree(root) {
  const paths = [root];

  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name, "en"));

    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      paths.push(absolute);
      if (entry.isDirectory()) {
        await visit(absolute);
      }
    }
  }

  await visit(root);

  // Update directories after their children so every entry receives the same
  // stable timestamp regardless of when the build was run.
  for (const target of paths.reverse()) {
    await utimes(target, normalizedDate, normalizedDate);
  }
}

async function zipEntries(rootName, stagingDir) {
  const root = path.join(stagingDir, rootName);
  const entries = [`${rootName}/`];

  async function visit(directory, relativeDirectory) {
    const children = await readdir(directory, { withFileTypes: true });
    children.sort((left, right) => left.name.localeCompare(right.name, "en"));

    for (const child of children) {
      const relative = path.posix.join(relativeDirectory, child.name);
      if (child.isDirectory()) {
        entries.push(`${relative}/`);
        await visit(path.join(directory, child.name), relative);
      } else {
        entries.push(relative);
      }
    }
  }

  await visit(root, rootName);
  return entries;
}

await mkdir(distDir, { recursive: true });
const stagingDir = await mkdtemp(path.join(os.tmpdir(), "tbt-release-"));

try {
  for (const release of releases) {
    const stagedSource = path.join(stagingDir, release.rootName);
    const excludedSource = path.join(release.source, "assets", "src");

    await cp(release.source, stagedSource, {
      recursive: true,
      filter(source) {
        return !(
          source === excludedSource ||
          source.startsWith(`${excludedSource}${path.sep}`)
        );
      },
    });

    await normalizeTree(stagedSource);
    const entries = await zipEntries(release.rootName, stagingDir);
    const stagedArchive = path.join(stagingDir, release.archiveName);
    const result = spawnSync("zip", ["-X", "-q", stagedArchive, "-@"], {
      cwd: stagingDir,
      encoding: "utf8",
      env: { ...process.env, LC_ALL: "C", TZ: "UTC" },
      input: `${entries.join("\n")}\n`,
    });

    if (result.error) {
      throw result.error;
    }
    if (result.status !== 0) {
      throw new Error(
        `zip failed for ${release.archiveName}: ${result.stderr || result.stdout}`,
      );
    }

    const archiveStats = await stat(stagedArchive);
    if (archiveStats.size === 0) {
      throw new Error(`zip produced an empty archive: ${release.archiveName}`);
    }

    const finalArchive = path.join(distDir, release.archiveName);
    const pendingArchive = `${finalArchive}.tmp`;
    await copyFile(stagedArchive, pendingArchive);
    await rename(pendingArchive, finalArchive);
    console.log(`Packaged ${release.archiveName} (${entries.length} entries)`);
  }
} finally {
  await rm(stagingDir, { recursive: true, force: true });
}
