import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GET } from "../app/api/health/route";

describe("Health Check API Route", () => {
  it("should return liveness alive status when requested", async () => {
    const req = new Request("http://localhost:3000/api/health?liveness=true");
    const res = await GET(req);

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "alive");
    assert.ok(typeof data.uptime === "number");
    assert.ok(data.timestamp);
  });
});
