import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createGateway } from "./gateway.mjs";

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";
const allowedOrigins = new Set(
  (process.env.GATEWAY_ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

const currentFile = fileURLToPath(import.meta.url);
const serviceRoot = path.resolve(path.dirname(currentFile), "..");
const projectRoot = path.resolve(serviceRoot, "..", "..");
const catalogPath = path.join(projectRoot, "src", "data", "background-catalog.json");
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const gateway = createGateway(catalog.items, { catalogVersion: "mock-catalog-v1" });

const server = createServer(async (request, response) => {
  const origin = request.headers.origin;
  applyCors(response, origin);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const body = await readJsonBody(request);
    const result = gateway.handle({
      method: request.method || "GET",
      url: request.url || "/",
      body,
    });
    sendJson(response, result.status, result.body);
  } catch (error) {
    sendJson(response, 400, {
      error: {
        code: "invalid_request",
        message: error instanceof Error ? error.message : "Invalid request",
      },
    });
  }
});

server.listen(port, host, () => {
  console.log("[image-gateway] mock server listening at http://" + host + ":" + port);
});

function applyCors(response, origin) {
  if (origin && allowedOrigins.has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": status === 200 ? "public, max-age=60" : "no-store",
  });
  response.end(JSON.stringify(body));
}

function readJsonBody(request) {
  if (request.method !== "POST") return Promise.resolve(undefined);

  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0;
    request.on("data", (chunk) => {
      bytes += chunk.length;
      if (bytes > 8_192) {
        reject(new Error("Request body too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      if (!chunks.length) {
        resolve(undefined);
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    request.on("error", reject);
  });
}
