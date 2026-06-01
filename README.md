# The Drill

A fire-drill tool for **spike**, **vacuum**, and **judgment** moments — pre-rehearsed
handling so the hard call isn't made at fire-time. Built from the *May 17, 2026*
framework. The whole thing ends Godward.

> *“Fix our eyes not on what is seen but unseen — what is seen is temporary,
> what is unseen is eternal.”* — 2 Corinthians 4:18

This is an installable, offline-capable **PWA** tuned for iOS (iPhone). Everything
runs in the browser; your log and settings are stored locally on your device.

---

## The three drills

| Drill | Cluster | Shape |
|------|---------|-------|
| **Spike** | lust · stress · anxiety · hate | Surrender → **Stillness** → Gratitude |
| **Vacuum** | empty gap · cruise · drift | Name → Connect → Anchor |
| **Judgment** | shame · self-hate · “I deserve this” | Interrupt → Overrule → Anchor |

Plus **Triage** (not sure which one), **SOS** (one-tap calls + 988), a **Log** with a
weekly **Ranking Siren** self-check, and **Settings**.

### Spike drill — what changed
The push-ups were **removed** on purpose: strength comes from the Lord, not from a
self-power tally. The drill's action is now:

1. Phone down. Lie down. **Hand on your heart.**
2. *“God, be merciful to me, a sinner.”* (Luke 18:13)
3. A **5-minute stillness timer** with peaceful, synthesized fingerpicked guitar and
   a warm **chime** when it ends. The screen stays awake while it runs.
4. Said **out loud**:
   *“I am here, Lord. Thank you for saving me. Please guard me against all evil.”*
   closing on **2 Corinthians 4:18** (which replaced Philippians 4:13 — a verse of
   contentment rather than strength).

A glowing **cross** sits quietly behind every screen as a steady reminder.

---

## Installing on iPhone (iPhone 16e and any iOS 16.4+)

1. Open the hosted URL in **Safari**.
2. Tap the **Share** button → **Add to Home Screen** → **Add**.
3. Open **The Drill** from its Home Screen icon (the glowing fire-alarm bell).
   It now runs full-screen with no browser chrome and works offline.

> Web notifications on iOS only work **after** the app is added to the Home Screen and
> opened from the icon. That's an Apple requirement, not a bug.

---

## Notifications

The app ships with a **built-in VAPID public key**, so the device can subscribe for
Web Push out of the box. In **Settings → Daily reminder** you can:

- Toggle reminders on (grants permission + subscribes),
- Set the **time** and a **custom message**,
- **Send a test notification**.

While the app is open it can fire the reminder locally. For **background daily
delivery** (app closed), a tiny scheduled GitHub Action is included:

1. Build/run the app once and copy your **subscription JSON** (saved at
   `localStorage["pushsub"]`).
2. In the repo: **Settings → Secrets and variables → Actions** → add
   - `VAPID_PRIVATE` — the private key from your build,
   - `DRILL_SUBSCRIPTION` — that subscription JSON.
3. Edit the cron in `.github/workflows/daily-reminder.yml` to your timezone (UTC).

The private key is **never committed** — only the public key lives in `app.js`.

---

## Hosting on GitHub Pages

A workflow (`.github/workflows/pages.yml`) deploys the site automatically.

1. Push to **main**.
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The site publishes at `https://<user>.github.io/<repo>/`.

All paths are relative, so it works from a project subpath. The service worker
(`sw.js`) caches the app shell for offline use.

---

## Project layout

```
index.html              app shell + iOS PWA meta
styles.css              neon gold / red on silver-carbon-fiber theme
app.js                  all logic: router, drills, audio, timer, notifications
sw.js                   service worker (offline cache + push display)
manifest.webmanifest    PWA manifest
assets/                 generated app icons (fire-alarm bell)
tools/                  build-time only: icon generator, VAPID/push helpers
.github/workflows/      Pages deploy + optional daily push
```

`tools/` is **not** shipped to the app — it only generates icons (`gen-icons.mjs`
from `icon.svg`) and sends pushes (`send-push.mjs`). `npm --prefix tools install`
to use them.

---

*No data leaves your device. The record is the answer to the Judge later — navigate
by the record, not the feeling.* 🤍
