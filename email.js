// email.js v2.0 - Word Traps
// Obfuscation mailto helper — fail-closed, config-driven.
//
// Responsibilities:
//   1. Decode obfuscated emails from WT_CONFIG (technical, never displayed raw)
//   2. Wire footer contact link: label from WT_WORDING, click → WT_SUPPORT_OPEN hook
//   3. Build mailto URLs for waitlist (used by ui.js)
//   4. Wire legacy data-user/data-domain links (success.html)
//
// Fail-closed contract:
//   - No label in WT_WORDING → no link (silent skip)
//   - No WT_SUPPORT_OPEN hook → no click handler (footer.js cleans up)
//   - No obfuscated email in WT_CONFIG → empty string (callers handle it)
//   - No fallbacks, no guessing, no email ever shown as text

(() => {
  "use strict";

  // ── Internal helpers ────────────────────────────────────────────

  /** Decode HTML-entity-obfuscated string (e.g. "a&#64;b&#46;c" → "a@b.c") */
  function decodeHtmlEntities(str) {
    const t = document.createElement("textarea");
    t.innerHTML = str;
    return t.value;
  }

  /** Sanitize a string for safe use in mailto query params (strip injection vectors) */
  function sanitize(str) {
    return String(str || "").replace(/[\r\n]/g, " ").trim();
  }

  // ── Exported: getSupportEmailDecoded ────────────────────────────
  // Returns decoded support email from WT_CONFIG.support.emailObfuscated.
  // Fail-closed: returns "" if anything is missing or invalid.

  function getSupportEmailDecoded() {
    try {
      const obf = String(window.WT_CONFIG?.support?.emailObfuscated || "").trim();
      if (!obf) return "";

      const email = decodeHtmlEntities(obf).replace(/[\r\n]/g, "").trim();
      if (!email || !email.includes("@")) return "";
      return email;
    } catch (_) {
      return "";
    }
  }

  // ── Exported: buildMailto ──────────────────────────────────────
  // Builds a mailto URL for waitlist signup.
  // Sources: WT_CONFIG.waitlist (mechanics) + WT_WORDING.waitlist (copy).
  // Fail-closed: returns "" if config is missing/disabled.

  function buildMailto(config, message) {
    const wl = config?.waitlist;
    if (!wl?.enabled) return "";

    // Decode recipient from config (technical, never displayed)
    const obf = String(wl.toEmailObfuscated || "").trim();
    if (!obf) return "";
    const to = decodeHtmlEntities(obf).replace(/[\r\n]/g, "").trim();
    if (!to || !to.includes("@")) return "";

    // Subject: prefix from config (technical) + suffix from wording (copy)
    const prefix = sanitize(wl.subjectPrefix);
    if (!prefix) return "";
    const suffix = sanitize(window.WT_WORDING?.waitlist?.emailSubjectSuffix);
    const subject = suffix ? `${prefix} ${suffix}` : prefix;

    // Body: template from wording with {idea} placeholder
    const idea = String(message || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
    const tpl = String(window.WT_WORDING?.waitlist?.emailBodyTemplate || "").trim();
    const body = tpl ? tpl.replaceAll("{idea}", idea) : idea;

    // Assemble mailto (recipient unencoded — some clients mishandle encoded recipients)
    const q = [];
    if (subject) q.push(`subject=${encodeURIComponent(subject)}`);
    if (body) q.push(`body=${encodeURIComponent(body)}`);
    return `mailto:${to}${q.length ? `?${q.join("&")}` : ""}`;
  }

  // ── Exported: initEmailLinks ───────────────────────────────────
  // Wires all email-related links in the DOM. Called by footer.js and main.js.

  function initEmailLinks() {
    try {
      const cfg = window.WT_CONFIG || {};
      const wording = window.WT_WORDING || {};

      // ─── 1) Footer contact link (#wt-contact-link) ───
      // Display: label from WT_WORDING.support.label (never raw email).
      // Click: delegates to WT_SUPPORT_OPEN hook (set by main.js).
      // Fail-closed: no label → skip entirely (footer.js removes empty links).

      const supportLink = document.getElementById("wt-contact-link");
      if (supportLink) {
        const label = String(wording.support?.label || "").trim();

        // Fail-closed: no label configured → leave link empty, footer.js cleans up.
        if (!label) {
          // Don't wire anything — footer.js will remove the empty link + separator.
        } else {
          // Visible text: always the wording label, never the email.
          supportLink.textContent = label;

          // Accessibility: explicit intent label
          supportLink.setAttribute("aria-label", label);

          // Fail-closed contract:
          // - If WT_SUPPORT_OPEN is missing, do not attach handler AND do not expose mailto.
          if (typeof window.WT_SUPPORT_OPEN !== "function") {
            supportLink.removeAttribute("href");
            supportLink.removeAttribute("target");
            supportLink.removeAttribute("rel");
          } else {
            // href: mailto for right-click "copy link address" (UX convenience).
            // Email is technical plumbing, never shown as text.
            const email = getSupportEmailDecoded();
            if (email) {
              supportLink.href = `mailto:${email}`;
            } else {
              // No email -> no href (still clickable via modal hook, but hook can decide what to do)
              supportLink.removeAttribute("href");
            }

            supportLink.addEventListener("click", (e) => {
              e.preventDefault();
              window.WT_SUPPORT_OPEN();
            });
          }
        }
      }


      // ─── 2) Legacy data-user/data-domain links (success.html) ───
      // Simple mailto wiring for links with data attributes.
      // Skip modal-only links and the footer contact link (handled above).

      const links = document.querySelectorAll("a[data-user][data-domain]");
      links.forEach((link) => {
        if (!link) return;
        if (link.id === "wt-contact-link") return;
        if (link.getAttribute("data-email-mode") === "modal") return;

        const user = link.getAttribute("data-user");
        const domain = link.getAttribute("data-domain");
        if (!user || !domain) return;

        link.href = `mailto:${user}@${domain}`;
      });
    } catch (_) {
      // Silent fail — fail-closed.
    }
  }

  // ── Public API ─────────────────────────────────────────────────

  window.WT_Email = {
    buildMailto,
    decodeObfuscated: decodeHtmlEntities,
    getSupportEmailDecoded,
    initEmailLinks
  };

})();