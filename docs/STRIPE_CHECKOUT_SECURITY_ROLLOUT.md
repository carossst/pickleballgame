# Stripe Checkout hardening — staged implementation (NOT DEPLOYABLE YET)

This branch introduces Worker endpoints only. It intentionally does not change the public checkout or success page. Do not merge or deploy as a finished security fix.

## Implemented
- POST /checkout/create: server-created Stripe Checkout Session, price IDs chosen from Worker environment, device reference bound to session.
- POST /checkout/verify: server retrieves Stripe payment status and purchased line items; checks product, device, amount, currency; records the session in D1.
- Fail closed when secrets or D1 are absent. Existing leaderboard endpoints unchanged.

## Required before enabling paid checkout
1. Add D1 migration: `CREATE TABLE IF NOT EXISTS premium_purchases (session_id TEXT PRIMARY KEY, device_id TEXT NOT NULL, created_at INTEGER NOT NULL);`
2. Configure Cloudflare Worker secret STRIPE_SECRET_KEY (test mode first), and STRIPE_PRICE_EARLY / STRIPE_PRICE_STANDARD (corresponding Stripe Price IDs, not payment links). Never commit credentials.
3. Implement client integration: checkout button requests /checkout/create and redirects to returned URL; success page reads session_id, calls /checkout/verify, and never generates its own activation code.
4. Replace format-only activation in storage.js with server-issued, verifiable entitlement. For offline play, issue a signed entitlement verified by an embedded public key, with an explicit revocation/expiration policy. Never trust a bare localStorage premium boolean. Preserve valid historical purchases with an explicit migration plan.
5. Consider Stripe webhook (signature verified) to record refunds/disputes and support purchase recovery. Verification on the success page alone does not handle customers who close the tab.
6. Validate test-mode success, canceled/failed/unpaid sessions, mismatched device, replay, tampered amount/price, guest/admin codes, legacy purchases, mobile and offline mode. Test CORS and the D1 migration against an isolated test database.
7. Only after the Worker and D1 migration are deployed and verified, enable the new frontend checkout. Coordinate version bump, cache busting, and rollback. Do not enable the new checkout until the whole flow is ready.

## Important limitations
- A client-only web game with offline content cannot provide perfect DRM; a determined user can alter client code. This work prevents arbitrary format-only code redemption once the old path is removed, but is not a guarantee against reverse engineering.
- A Stripe Checkout session ID is not proof of payment; server verification is mandatory.
- Device IDs are browser identifiers, not authentication. A device-bound receipt must not be treated as transferable account ownership.
- The existing customer activation flow remains vulnerable until the follow-up frontend and entitlement changes are implemented.
