import test from "node:test";
import assert from "node:assert/strict";
import { createGateway } from "../src/gateway.mjs";

const catalog = [
  {
    id: "dawn-1",
    themes: ["dawn"],
    url: "https://images.unsplash.com/photo-dawn",
    credit: "Unsplash · Dawn",
  },
  {
    id: "night-1",
    themes: ["night"],
    url: "https://images.unsplash.com/photo-night",
    credit: "Unsplash · Night",
  },
];

test("lists only the requested theme in gateway DTO format", () => {
  const gateway = createGateway(catalog);
  const result = gateway.handle({
    method: "GET",
    url: "/v1/backgrounds?theme=dawn&page=0&limit=18&orientation=portrait",
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.items.length, 1);
  assert.deepEqual(result.body.items[0], {
    id: "mock:dawn-1",
    imageUrl: "https://images.unsplash.com/photo-dawn",
    provider: "unsplash",
    attribution: "Unsplash · Dawn",
    sourceUrl: "https://images.unsplash.com/photo-dawn",
    license: "curated-catalog",
    exportAllowed: true,
  });
});

test("rejects unsupported themes and malformed pagination", () => {
  const gateway = createGateway(catalog);

  assert.equal(
    gateway.handle({ method: "GET", url: "/v1/backgrounds?theme=other" }).status,
    400,
  );
  assert.equal(
    gateway.handle({
      method: "GET",
      url: "/v1/backgrounds?theme=dawn&page=-1",
    }).status,
    400,
  );
});

test("keeps the first selection stable for one installation, date and theme", () => {
  const gateway = createGateway(catalog);
  const first = gateway.handle({
    method: "POST",
    url: "/v1/backgrounds/selection",
    body: {
      assetId: "mock:dawn-1",
      date: "2026-07-29",
      theme: "dawn",
      installationId: "test-installation",
    },
  });
  const repeated = gateway.handle({
    method: "POST",
    url: "/v1/backgrounds/selection",
    body: {
      assetId: "mock:dawn-1",
      date: "2026-07-29",
      theme: "dawn",
      installationId: "test-installation",
    },
  });

  assert.equal(first.status, 201);
  assert.equal(repeated.status, 200);
  assert.equal(repeated.body.assetId, first.body.assetId);
  assert.equal(repeated.body.selectedAt, first.body.selectedAt);
});

test("does not allow selecting an asset outside the requested theme", () => {
  const gateway = createGateway(catalog);
  const result = gateway.handle({
    method: "POST",
    url: "/v1/backgrounds/selection",
    body: {
      assetId: "mock:night-1",
      date: "2026-07-29",
      theme: "dawn",
      installationId: "test-installation",
    },
  });

  assert.equal(result.status, 404);
});
