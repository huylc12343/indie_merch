import { readFile } from "node:fs/promises";
import path from "node:path";

export type QueryResult<Row = Record<string, unknown>> = {
  rows: Row[];
  rowCount: number | null;
};

export type DatabaseClient = {
  query<Row = Record<string, unknown>>(
    sql: string,
    values?: unknown[],
  ): Promise<QueryResult<Row>>;
  release(): void;
};

export type DatabasePool = {
  query<Row = Record<string, unknown>>(
    sql: string,
    values?: unknown[],
  ): Promise<QueryResult<Row>>;
  connect(): Promise<DatabaseClient>;
};

type PgModule = { Pool: new (options: { connectionString: string }) => DatabasePool };
type DatabaseGlobal = typeof globalThis & {
  __indieMerchPool?: DatabasePool;
  __indieMerchSchemaReady?: Promise<void>;
};

const databaseGlobal = globalThis as DatabaseGlobal;

async function loadPool(): Promise<DatabasePool> {
  if (databaseGlobal.__indieMerchPool) return databaseGlobal.__indieMerchPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required. Start PostgreSQL and configure .env.local.");
  }

  // Keep pg as a server runtime dependency so Next can build without resolving it in client bundles.
  const loadModule = new Function(
    "specifier",
    "return import(specifier)",
  ) as (specifier: string) => Promise<PgModule>;
  const { Pool } = await loadModule("pg");
  databaseGlobal.__indieMerchPool = new Pool({ connectionString });
  return databaseGlobal.__indieMerchPool;
}

export async function getDatabase(): Promise<DatabasePool> {
  const pool = await loadPool();
  if (!databaseGlobal.__indieMerchSchemaReady) {
    databaseGlobal.__indieMerchSchemaReady = (async () => {
      const schema = await readFile(path.join(process.cwd(), "db", "schema.sql"), "utf8");
      await pool.query(schema);
    })();
  }
  await databaseGlobal.__indieMerchSchemaReady;
  return pool;
}

export async function withTransaction<Result>(
  operation: (client: DatabaseClient) => Promise<Result>,
): Promise<Result> {
  const pool = await getDatabase();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
