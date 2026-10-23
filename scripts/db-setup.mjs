import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const filename of [".env.local", ".env"]) {
  try {
    const contents = await readFile(path.join(root, filename), "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*DATABASE_URL=(.*)\s*$/);
      if (match && process.env.DATABASE_URL === undefined) {
        process.env.DATABASE_URL = match[1].replace(/^(["'])(.*)\1$/, "$2");
      }
    }
  } catch {
    // Environment variables can also be provided by the shell.
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("Set DATABASE_URL in .env.local before running npm run db:setup.");
}

const { Pool } = await import("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  const schema = await readFile(path.join(root, "db", "schema.sql"), "utf8");
  const seed = await readFile(path.join(root, "db", "seed.sql"), "utf8");
  await pool.query(schema);
  await pool.query(seed);
  console.log("PostgreSQL schema and mock merch data are ready.");
} finally {
  await pool.end();
}
