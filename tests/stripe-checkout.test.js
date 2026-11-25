import { afterEach, describe, expect, it, vi } from "vitest";
import { handleCheckoutCreate, handleCheckoutVerify } from "../leaderboard-worker/src/stripe-checkout.js";

const env = {
  STRIPE_SECRET_KEY: "sk_test_fake",
  STRIPE_PRICE_EARLY: "price_early",
  STRIPE_PRICE_STANDARD: "price_standard"
};
const deviceId = "12345678-1234-1234-1234-123456789abc";
const request = (data) => new Request("https://example.com/", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data)
});
afterEach(() => vi.unstubAllGlobals());

describe("Stripe Checkout security", () => {
  it("fails closed without credentials", async () => {
    const response = await handleCheckoutCreate(request({ priceKey: "EARLY", deviceId }), {});
    expect(response.status).toBe(503);
  });
  it("rejects invalid client-supplied prices and device IDs", async () => {
    expect((await handleCheckoutCreate(request({ priceKey: "FREE", deviceId }), env)).status).toBe(400);
    expect((await handleCheckoutCreate(request({ priceKey: "EARLY", deviceId: "bad" }), env)).status).toBe(400);
  });
  it("uses server-controlled Stripe price ID", async () => {
    vi.stubGlobal("fetch", vi.fn(async (_url, options) => {
      const form = new URLSearchParams(options.body);
      expect(form.get("line_items[0][price]")).toBe("price_early");
      expect(form.get("client_reference_id")).toBe(deviceId);
      return new Response(JSON.stringify({ id: "cs_test_123456789", url: "https://checkout.stripe.com/c/pay/test" }), { status: 200 });
    }));
    const response = await handleCheckoutCreate(request({ priceKey: "EARLY", deviceId }), env);
    expect(response.status).toBe(200);
    expect((await response.json()).ok).toBe(true);
  });
  it("refuses unpaid sessions", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      id: "cs_test_123456789", payment_status: "unpaid", status: "open",
      mode: "payment", client_reference_id: deviceId,
      metadata: { product: "prq-premium-v1", device_id: deviceId }
    }), { status: 200 })));
    const response = await handleCheckoutVerify(request({ sessionId: "cs_test_123456789", deviceId }), {
      ...env, DB: {}
    });
    expect(response.status).toBe(403);
  });
});
