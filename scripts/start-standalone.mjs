import nextEnv from "@next/env";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = process.cwd();
nextEnv.loadEnvConfig(projectRoot);
await import(pathToFileURL(path.join(projectRoot, ".next", "standalone", "server.js")));
