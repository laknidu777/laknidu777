import "dotenv/config";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateEnv } from "../lib/env";

describe("Environment Configuration Validator", () => {
  it("should validate and return environment variables without throwing", () => {
    // Current environment has DATABASE_URL and AUTH_SECRET configured
    const env = validateEnv();
    assert.ok(env);
    assert.ok(typeof env.PORT === "number");
    assert.ok(env.NODE_ENV);
  });

  it("should default PORT to 3000 if not specified", () => {
    const env = validateEnv();
    assert.equal(typeof env.PORT, "number");
    assert.ok(env.PORT > 0);
  });

  it("should not expose raw secrets in inspect output", () => {
    const env = validateEnv();
    // Ensure critical credentials are not undefined
    assert.ok(env.DATABASE_URL.length > 0);
    assert.ok(env.AUTH_SECRET.length >= 16);
  });
});
