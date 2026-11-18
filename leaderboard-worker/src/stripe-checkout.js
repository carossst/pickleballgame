// Stripe Checkout integration. Disabled unless STRIPE_SECRET_KEY and price IDs are configured.
// This module does not trust browser claims about payment or price.
const ORIGIN = "https://www.pickleballrulesquiz.com";
const STRIPE = "https://api.stripe.com/v1";
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { "content-type": "application/json", "cache-control": "no-store" }
});
function validDevice(id) {
  return typeof id === "string" && /^[a-f0-9-]{36}$/.test(id);
}
async function stripe(path, secret, options = {}) {
  const response = await fetch(STRIPE + path, {
    ...options,
    headers: { authorization: "Bearer " + secret, ...(options.headers || {}) }
  });
  const body = await response.json();
  if (!response.ok) throw new Error("Stripe API request failed: " + response.status);
  return body;
}
export async function handleCheckoutCreate(request, env) {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_EARLY || !env.STRIPE_PRICE_STANDARD) {
    return json({ ok: false, error: "Checkout not configured" }, 503);
  }
  const body = await request.json().catch(() => null);
  if (!validDevice(body?.deviceId) || !["EARLY", "STANDARD"].includes(body?.priceKey)) {
    return json({ ok: false, error: "Invalid request" }, 400);
  }
  const priceId = body.priceKey === "EARLY" ? env.STRIPE_PRICE_EARLY : env.STRIPE_PRICE_STANDARD;
  const form = new URLSearchParams({
    mode: "payment",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    client_reference_id: body.deviceId,
    success_url: ORIGIN + "/success.html?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: ORIGIN + "/?checkout=cancel",
    "metadata[product]": "prq-premium-v1",
    "metadata[device_id]": body.deviceId
  });
  const session = await stripe("/checkout/sessions", env.STRIPE_SECRET_KEY, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString()
  });
  if (!session.id || !session.url || !session.url.startsWith("https://checkout.stripe.com/")) {
    return json({ ok: false, error: "Invalid checkout session" }, 502);
  }
  return json({ ok: true, url: session.url });
}
export async function handleCheckoutVerify(request, env) {
  if (!env.STRIPE_SECRET_KEY || !env.DB) return json({ ok: false, error: "Verification not configured" }, 503);
  const body = await request.json().catch(() => null);
  if (!validDevice(body?.deviceId) || typeof body?.sessionId !== "string" ||
      !/^cs_(test_)?[A-Za-z0-9_]{8,200}$/.test(body.sessionId)) {
    return json({ ok: false, error: "Invalid request" }, 400);
  }
  const session = await stripe("/checkout/sessions/" + encodeURIComponent(body.sessionId), env.STRIPE_SECRET_KEY);
  if (session.payment_status !== "paid" || session.status !== "complete" ||
      session.mode !== "payment" || session.client_reference_id !== body.deviceId ||
      session.metadata?.product !== "prq-premium-v1" ||
      session.metadata?.device_id !== body.deviceId ||
      ![env.STRIPE_PRICE_EARLY, env.STRIPE_PRICE_STANDARD].includes(session?.line_items?.data?.[0]?.price?.id)) {
    // The line item is retrieved separately below; this guard intentionally excludes it.
    if (session.payment_status !== "paid" || session.status !== "complete" ||
        session.mode !== "payment" || session.client_reference_id !== body.deviceId ||
        session.metadata?.product !== "prq-premium-v1" || session.metadata?.device_id !== body.deviceId) {
      return json({ ok: false, error: "Payment not verified" }, 403);
    }
  }
  const items = await stripe("/checkout/sessions/" + encodeURIComponent(body.sessionId) + "/line_items?limit=10", env.STRIPE_SECRET_KEY);
  if (items.data?.length !== 1 || items.data[0]?.quantity !== 1 ||
      ![env.STRIPE_PRICE_EARLY, env.STRIPE_PRICE_STANDARD].includes(items.data[0]?.price?.id) ||
      session.currency !== "usd" || session.amount_total !== items.data[0]?.amount_total) {
    return json({ ok: false, error: "Incorrect product or amount" }, 403);
  }
  // D1's unique session key prevents multiple distinct devices claiming the same purchase.
  const existing = await env.DB.prepare("SELECT device_id FROM premium_purchases WHERE session_id = ?1")
    .bind(session.id).first();
  if (existing && existing.device_id !== body.deviceId) return json({ ok: false, error: "Already claimed" }, 409);
  if (!existing) {
    await env.DB.prepare("INSERT OR IGNORE INTO premium_purchases (session_id, device_id, created_at) VALUES (?1, ?2, ?3)")
      .bind(session.id, body.deviceId, Date.now()).run();
  }
  return json({ ok: true, verified: true });
}
