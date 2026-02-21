# 🇫🇷 Test Your French: Word Traps

> **A short-form learning game about linguistic judgment — part of the Test Your French ecosystem.**

---

## 💡 Why This Exists

Learning a language often gives you confidence too early.

You recognize words.  
They look familiar.  
They *feel* correct.

And that’s exactly where mistakes happen.

**Word Traps** exists to test one specific skill:

> **Your ability to judge meaning — not to recall vocabulary, follow rules, or memorize lessons.**

No courses.  
No progression system.  
No artificial help.

Just a decision, repeated under pressure:

**Is this actually correct — or not?**

---

## 🎯 What the Game Is

**Word Traps** is a **short-form learning game** built around continuous runs.

### Core rules

- A fixed pool of **100 word traps**
- Words are shown **one at a time**
- Binary judgment: **True / False**
- You start with **3 chances**
- Each wrong answer consumes **1 chance**
- At **0 chances → Game over**
- Score = number of correct judgments  
  → expressed as **French Points**

> A run ends when all 3 chances are used.

There are:

- ❌ No levels  
- ❌ No difficulty curve  
- ❌ No adaptive help  
- ❌ No time pressure  

The challenge is **cognitive**, not mechanical.

All linguistic content is human-curated and loaded from `content.json`.

---

## 🧠 What Makes It Different

### Judgment, Not Teaching

This is **not** a course.  
This is **not** pedagogy.

The game does not explain *before* you decide.  
Feedback comes *after* judgment.

Discomfort is intentional.

> The game tests instinct, not preparation.

---

### Finite Content, Fair Randomness

- Exactly **100 word traps**
- Words are shown in a **random order**
- You will see **all 100 before any repeats**
- After exhaustion, runs continue with standard random draw

No rigging.  
No scripting.  
No manipulation.

---

### Clear Identity

- Score is expressed in **French Points**
- “French Points” appear clearly at the end of each run
- In-run display uses the compact form (`FP`) to stay readable

This creates a **memorable unit**, not just a number.

---

## 🆓 Free & Premium

### Free

- **2 free runs**
- Then **1 grace run**, immediately
- No daily reset
- No waiting mechanic

Once the grace run is used, the free experience ends.

---

### Premium

Premium **does not change the game**.

It unlocks only:

- **Unlimited runs**
- **Practice mode (Mistakes only)**  
  Replay only words you previously got wrong
- **Personal best tracking** (local, on this device)

No advantage.  
No easier mode.  
Just more play.

All rules are enforced locally in `storage.js`.

---

## 💳 Payments, Data & Privacy

- No account
- No backend
- No tracking
- No analytics

All game data lives **locally** in the browser.

Payments are handled by **Stripe Checkout**.  
The game never sees or stores payment data.

Premium activation is stored locally on the device.

---

## 🛠️ How It Was Built

### Config-First Architecture

The product is driven by **a single configuration file** (`config.js`).

This file is structured in strict sections:

- Game rules
- Access limits
- UI labels
- User-facing copy

Rules never contain text.  
Copy never encodes rules.

This makes the product **readable, auditable, and safe to iterate**.

---

### Vibe Coding with AI

This project follows a **human-led, AI-assisted** workflow.

AI is used to:

- Clarify reasoning
- Stress-test decisions
- Refactor safely
- Detect inconsistencies

AI **never decides the product**.

There is:

- No AI during gameplay
- No generated linguistic content
- No black-box logic

AI acts as a **pair programmer**, not a decision-maker.

Ownership remains fully human.

---

## 📁 Project Structure

```
/
├─ index.html        # App shell
├─ style.css         # Design system + UI (KISS)
├─ config.js         # Single source of truth
├─ storage.js        # Local storage & product rules
├─ game.js           # Run engine & selection logic
├─ ui.js             # UI rendering & accessibility
├─ main.js           # Bootstrap & orchestration
├─ pwa.js            # Install prompt (A2HS)
├─ email.js          # Email obfuscation
├─ content.json      # Linguistic content
├─ success.html      # Post-payment activation
├─ sw.js             # Service Worker
├─ manifest.json     # PWA manifest
└─ icons/            # PWA icons
```

Each file has **one responsibility**.  
No framework. No abstraction layers.

---

## 📱 PWA & Offline

- Installable on mobile and desktop
- Fully usable offline after first load

Caching strategy:

- App shell: cache-first
- `content.json`: stale-while-revalidate
- Stripe assets: never cached

---

## 🚀 Getting Started

```bash
# Serve with any static server
npx serve .
# or
python -m http.server 8000
```

Service Workers require a local server — do not open files directly.

---

## 🚫 Non-Negotiable Constraints

- ❌ No backend
- ❌ No accounts
- ❌ No external tracking
- ❌ No level-based progression
- ❌ No pedagogical redesign
- ❌ No cross-game promises

Constraints are product decisions, not limitations.

---

## 🧠 What This Project Demonstrates

- Designing a game around **judgment**
- Treating constraints as UX features
- Shipping a complete monetized PWA with **no backend**
- Disciplined, transparent AI-assisted development
- Clear separation between logic, UI, and copy

---

## 👩‍💻 About the Creator

Built by **Carole Stromboni** — French native (Paris), product-oriented builder.

**Word Traps** is part of the **Test Your French** ecosystem and follows the same principles:

- clarity over complexity  
- judgment over hand-holding  
- full human ownership of decisions  

This project explores a simple question:

> *Can a single person design, build, and ship a serious product using AI responsibly?*

Here, the answer is **yes** — with structure, discipline, and clear boundaries.

---

## 📄 License

MIT — Use it. Fork it. Learn from it. Build your own.

