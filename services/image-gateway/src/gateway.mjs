import { createHash } from "node:crypto";

const SUPPORTED_THEMES = new Set([
  "dawn",
  "night",
  "wilderness",
  "mist",
  "parchment",
  "sanctuary",
  "olive",
  "river",
]);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function createGateway(catalog, options = {}) {
  const catalogVersion = options.catalogVersion || "mock-v1";
  const selections = options.selections || new Map();

  return {
    handle(input) {
      const method = input.method.toUpperCase();
      const url = new URL(input.url, "http://gateway.local");

      if (method === "GET" && url.pathname === "/health") {
        return ok({ status: "ok", catalogVersion });
      }

      if (method === "GET" && url.pathname === "/v1/backgrounds") {
        return listBackgrounds(url.searchParams, catalog, catalogVersion);
      }

      if (method === "POST" && url.pathname === "/v1/backgrounds/selection") {
        return selectBackground(input.body, catalog, catalogVersion, selections);
      }

      return fail(404, "not_found", "Route not found");
    },
  };
}

function listBackgrounds(params, catalog, catalogVersion) {
  const theme = params.get("theme") || "";
  const page = parseBoundedInt(params.get("page"), 0, 0, 10_000);
  const limit = parseBoundedInt(params.get("limit"), 18, 1, 30);
  const orientation = params.get("orientation") || "portrait";

  if (!SUPPORTED_THEMES.has(theme)) {
    return fail(400, "invalid_theme", "Unsupported theme");
  }
  if (orientation !== "portrait") {
    return fail(400, "invalid_orientation", "Only portrait is supported");
  }
  if (page === null || limit === null) {
    return fail(400, "invalid_pagination", "Invalid page or limit");
  }

  const matching = catalog
    .filter((item) => Array.isArray(item.themes) && item.themes.includes(theme))
    .filter((item) => Boolean(item.id && item.url))
    .sort((a, b) => a.id.localeCompare(b.id));

  const start = page * limit;
  const slice = matching.slice(start, start + limit);
  const items = slice.map((item) => toGatewayItem(item));

  return ok({
    version: catalogVersion,
    items,
    nextPage: start + limit < matching.length ? page + 1 : null,
  });
}

function selectBackground(body, catalog, catalogVersion, selections) {
  const input = asObject(body);
  if (!input) return fail(400, "invalid_body", "JSON object required");

  const assetId = asString(input.assetId);
  const date = asString(input.date);
  const theme = asString(input.theme);
  const installationId = asString(input.installationId);

  if (!assetId || !date || !theme || !installationId) {
    return fail(400, "invalid_selection", "assetId, date, theme and installationId are required");
  }
  if (!DATE_RE.test(date) || !SUPPORTED_THEMES.has(theme)) {
    return fail(400, "invalid_selection", "Invalid date or theme");
  }

  const expectedId = assetId.replace(/^mock:/, "");
  const item = catalog.find(
    (candidate) =>
      candidate.id === expectedId &&
      Array.isArray(candidate.themes) &&
      candidate.themes.includes(theme),
  );
  if (!item) return fail(404, "asset_not_found", "Asset is not available for this theme");

  const installationHash = hashInstallationId(installationId);
  const key = [installationHash, date, theme].join(":");
  const existing = selections.get(key);
  if (existing) return ok(existing);

  const selection = {
    assetId,
    date,
    theme,
    catalogVersion,
    selectedAt: new Date().toISOString(),
  };
  selections.set(key, selection);
  return ok(selection, 201);
}

function toGatewayItem(item) {
  return {
    id: "mock:" + item.id,
    imageUrl: item.url,
    provider: providerFromUrl(item.url),
    attribution: item.credit || "Curated background catalog",
    sourceUrl: item.url,
    license: "curated-catalog",
    exportAllowed: true,
  };
}

function providerFromUrl(url) {
  if (url.includes("images.unsplash.com")) return "unsplash";
  if (url.includes("pexels.com")) return "pexels";
  if (url.includes("pixabay.com")) return "pixabay";
  return "mock";
}

function parseBoundedInt(raw, fallback, min, max) {
  if (raw === null || raw === "") return fallback;
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= min && value <= max ? value : null;
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function asString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function hashInstallationId(value) {
  return createHash("sha256").update(value).digest("hex");
}

function ok(body, status = 200) {
  return { status, body };
}

function fail(status, code, message) {
  return { status, body: { error: { code, message } } };
}
