// footer.js — shared footer injection (uses email.js)
// Responsibility: inject footer markup into #wt-footer-root when needed.
// Branding, version, labels and locale-aware links are hydrated here. Contact is handled by email.js.
// Locale: locale-aware hrefs come from WT_WORDING.footer.links.* via data-wt-href (hydrated by wording.js).
//         Re-runs hydration on "wt:locale-change".
(() => {
    "use strict";

    function hasNonEmptyContent(el) {
        if (!el) return false;
        const txt = String(el.textContent || "").replace(/\s+/g, " ").trim();
        return txt.length > 0 || el.children.length > 0;
    }

    function injectIntoFooterRoot(root) {
        if (!root) return;

        // Upgrade-safe guard:
        // - If footer already exists BUT is missing the Press link, we re-inject.
        // - If Press exists, we keep current DOM (do not overwrite).
        if (hasNonEmptyContent(root)) {
            const hasPress = !!(root.querySelector && root.querySelector("#wt-press-link"));
            if (hasPress) return;
        }

        root.innerHTML = `
      <div class="wt-container">
        <div class="wt-footer-inner">
          <!-- Ligne 1 : Branding -->
          <div class="wt-footer-row wt-footer-row--brand">
            <span class="wt-footer-creator" data-wt-brand="creatorLine"></span>
          </div>

          <div class="wt-footer-row">
            <em class="wt-muted" data-wt-wording="footer.rulebookNote"></em>
          </div>

          <!-- Ligne 2 : Liens utilitaires -->
          <div class="wt-footer-row wt-footer-row--links">
            <a id="wt-contact-link" class="wt-footer-link" href="#" data-wt-wording="footer.contact"></a>
            <span class="wt-footer-sep" aria-hidden="true">·</span>
            <a id="wt-tyf-link" class="wt-footer-link" href="#"
              data-wt-wording="footer.links.bonjourPickleball.label"
              data-wt-href="footer.links.bonjourPickleball.href"
              target="_blank" rel="noopener"></a>
            <!-- wt-footer-sep--tyf is a marker class for JS targeting only. Styling comes from wt-footer-sep. -->
            <span class="wt-footer-sep wt-footer-sep--tyf" aria-hidden="true">·</span>
            <a id="wt-privacy-link" class="wt-footer-link" href="./privacy.html" target="_blank" rel="noopener"
              data-wt-wording="footer.privacy"></a>
            <span class="wt-footer-sep" aria-hidden="true">·</span>
            <a id="wt-terms-link" class="wt-footer-link" href="./terms.html" target="_blank" rel="noopener"
              data-wt-wording="footer.terms"></a>
            <span class="wt-footer-sep" aria-hidden="true">·</span>
            <a id="wt-press-link" class="wt-footer-link" href="./press.html" target="_blank" rel="noopener"
              data-wt-wording="footer.press"></a>
          </div>
        </div>
      </div>
    `;
    }

    function hydrateFooter(root) {
        if (!root) return;

        const wording = window.WT_Wording;
        if (!wording || typeof wording.hydrate !== "function") return;

        wording.hydrate(root);

        // Locale-aware Bonjour Pickleball link
        try {
            const appUrlEl = root.querySelector("#wt-tyf-link");
            const appUrlSep = root.querySelector(".wt-footer-sep--tyf");

            if (appUrlEl) {
                const url = String(appUrlEl.getAttribute("href") || "").trim();
                const label = String(appUrlEl.textContent || "").trim();
                const shouldShow = !!url && url !== "#" && !!label;

                if (shouldShow) {
                    appUrlEl.setAttribute("target", "_blank");
                    appUrlEl.setAttribute("rel", "noopener");

                    appUrlEl.style.display = "";
                    if (appUrlSep) appUrlSep.style.display = "";
                } else {
                    appUrlEl.style.display = "none";
                    if (appUrlSep) appUrlSep.style.display = "none";
                }
            }
        } catch (_) { /* silent */ }

    }

    function tryInject() {
        const root = document.getElementById("wt-footer-root");
        if (!root) return;

        injectIntoFooterRoot(root);
        hydrateFooter(root);

        // Let email.js wire the contact link, but enforce FAIL-CLOSED here:
        // - If Contact text looks like an email (contains "@"), remove it (anti-leak).
        if (window.WT_Email && typeof window.WT_Email.initEmailLinks === "function") {
            window.WT_Email.initEmailLinks();
        }

        const contact = document.getElementById("wt-contact-link");
        if (contact) {
            const txt = String(contact.textContent || "").trim();
            const looksLikeEmail = txt.includes("@");

            // Fail-closed rules:
            // - Never show raw email as visible text.
            // - Keep Contact on all pages if wording exists; email.js wires behavior.
            const shouldRemove =
                looksLikeEmail ||
                (!txt);

            if (shouldRemove) {
                const sep = contact.nextElementSibling; contact.remove();
                if (sep && sep.classList && sep.classList.contains("wt-footer-sep")) {
                    sep.remove();
                }
            }
        }
    }

    tryInject();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", tryInject);
    }

    // Locale reactivity: re-hydrate footer labels on locale change.
    // Footer DOM stays in place; only text content (and any data-wt-href) is refreshed.
    try {
        window.addEventListener("wt:locale-change", () => {
            const root = document.getElementById("wt-footer-root");
            if (root) hydrateFooter(root);
        });
    } catch (_) { /* silent */ }
})();
