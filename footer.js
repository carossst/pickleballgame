// footer.js — Word Traps shared footer injection (uses email.js)
// Responsibility: inject Word Traps footer markup into #wt-footer-root when needed.
// Branding/version/labels are handled by config.js. Contact is handled by email.js.

(() => {
    "use strict";

    function hasNonEmptyContent(el) {
        if (!el) return false;
        const txt = String(el.textContent || "").replace(/\s+/g, " ").trim();
        return txt.length > 0 || el.children.length > 0;
    }

    function injectIntoFooterRoot(root) {
        if (!root) return;
        if (hasNonEmptyContent(root)) return;

        root.innerHTML = `
      <div class="wt-container">
        <div class="wt-footer-inner">
          <div class="wt-footer-row wt-footer-row--brand">
            <span class="wt-footer-creator" data-wt-brand="creatorLine"></span>
          </div>

          <div class="wt-footer-row wt-footer-row--links">
            <a id="wt-contact-link" class="wt-footer-link" href="#"></a>
            <span class="wt-footer-sep" aria-hidden="true">·</span>

            <a id="wt-tyf-link" class="wt-footer-link" href="#" target="_blank" rel="noopener"></a>
            <span class="wt-footer-sep wt-footer-sep--tyf" aria-hidden="true">·</span>

            <a id="wt-privacy-link" class="wt-footer-link" href="./privacy.html" target="_blank" rel="noopener" data-wt-wording="footer.privacy"></a>
            <span class="wt-footer-sep" aria-hidden="true">·</span>

            <a id="wt-terms-link" class="wt-footer-link" href="./terms.html" target="_blank" rel="noopener" data-wt-wording="footer.terms"></a>
            <span class="wt-footer-sep" aria-hidden="true">·</span>

            <span class="wt-footer-version" data-wt-version></span>
          </div>
        </div>
      </div>
    `;

    }

    function tryInject() {
        const existing = document.querySelector("footer.wt-footer");
        if (existing && hasNonEmptyContent(existing)) return;

        const root = document.getElementById("wt-footer-root");
        if (root) injectIntoFooterRoot(root);

        // Let email.js wire the contact link, but enforce FAIL-CLOSED here:
        // - If the support hook is missing, remove Contact entry.
        // - If Contact text looks like an email (contains "@"), remove it (anti-leak).
        if (window.WT_Email && typeof window.WT_Email.initEmailLinks === "function") {
            window.WT_Email.initEmailLinks();
        }

        const contact = document.getElementById("wt-contact-link");
        if (contact) {
            const hasSupportHook = (typeof window.WT_SUPPORT_OPEN === "function");
            const txt = String(contact.textContent || "").trim();
            const looksLikeEmail = txt.includes("@");

            if (!hasSupportHook || looksLikeEmail) {
                const sep = contact.nextElementSibling;
                contact.remove();
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
})();