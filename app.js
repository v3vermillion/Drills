/* ───────────────────────────────────────────────────────────────────────────
   THE DRILL  —  a fire-drill tool for spike / vacuum / judgment moments.
   Built from the May 17, 2026 framework. Navigate by that date.
   Vanilla JS PWA. State + memory persist locally (localStorage). Offline-first.
─────────────────────────────────────────────────────────────────────────── */
"use strict";

const MARKER_DATE = "May 17, 2026";

/* Built-in VAPID public key (the matching private key lives only as a repo
   secret — see README). Used to subscribe this device for Web Push. */
const VAPID_PUBLIC =
  "BJKynbDamOi4l7iMWFproKjW8_OQGJLM1cemrUfex0p8Rhl_q5qh6FZu0K9yPlgBoj-nzCWtHcgJ3DG1qu5WH6g";

/* ── Scripture ─────────────────────────────────────────────────────────── */

const PSALM_103_OPENING = `Bless the Lord, O my soul,
and all that is within me,
bless his holy name!
Bless the Lord, O my soul,
and forget not all his benefits—
who forgives all your iniquity,
who heals all your diseases,
who redeems your life from the pit,
who crowns you with steadfast love and mercy,
who satisfies you with good
so that your youth is renewed like the eagle's.

For as high as the heavens are above the earth,
so great is his steadfast love toward those who fear him;
as far as the east is from the west,
so far does he remove our transgressions from us.`;

const PSALM_51_OPENING = `Have mercy on me, O God,
according to your steadfast love;
according to your abundant mercy
blot out my transgressions.
Wash me thoroughly from my iniquity,
and cleanse me from my sin.

Create in me a clean heart, O God,
and renew a right spirit within me.
Cast me not away from your presence,
and take not your Holy Spirit from me.
Restore to me the joy of your salvation,
and uphold me with a willing spirit.

The sacrifices of God are a broken spirit;
a broken and contrite heart, O God,
you will not despise.`;

/* ── Storage (localStorage — cached locally, offline-safe) ─────────────── */

const LS = window.localStorage;

function logDrill(entry) {
  try {
    const ts = Date.now();
    LS.setItem(`drill:${ts}`, JSON.stringify({ ...entry, ts }));
  } catch (e) { console.error("log failed", e); }
}

function loadDrills() {
  const out = [];
  try {
    for (let i = 0; i < LS.length; i++) {
      const k = LS.key(i);
      if (k && k.startsWith("drill:")) {
        try { out.push(JSON.parse(LS.getItem(k))); } catch (e) {}
      }
    }
  } catch (e) {}
  return out.sort((a, b) => b.ts - a.ts);
}

const DEFAULT_SETTINGS = { momPhone: "", sydneyPhone: "", momName: "Mom", sydneyName: "Sydney" };
function loadSettings() {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(LS.getItem("settings") || "{}") }; }
  catch (e) { return { ...DEFAULT_SETTINGS }; }
}
function saveSettings(s) { try { LS.setItem("settings", JSON.stringify(s)); } catch (e) {} }

const DEFAULT_NOTIF = { enabled: false, time: "07:30", message: "I am here, Lord. Bring this day to God." };
function loadNotif() {
  try { return { ...DEFAULT_NOTIF, ...JSON.parse(LS.getItem("notif") || "{}") }; }
  catch (e) { return { ...DEFAULT_NOTIF }; }
}
function saveNotif(n) { try { LS.setItem("notif", JSON.stringify(n)); } catch (e) {} }

/* ── Icons (inline SVG, Lucide geometry, MIT) ──────────────────────────── */

const ICON_PATHS = {
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  wind: '<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 1.8 4.2H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
};
const FILLED = new Set(["flame", "heart", "play"]);

function icon(name, size = 20) {
  const fill = FILLED.has(name) ? 'fill="currentColor" stroke="none"' : 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" ${fill} aria-hidden="true">${ICON_PATHS[name] || ""}</svg>`;
}

/* ── Small DOM helpers ─────────────────────────────────────────────────── */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const root = () => document.getElementById("app");
const $ = (sel, ctx = root()) => ctx.querySelector(sel);
const $$ = (sel, ctx = root()) => Array.from(ctx.querySelectorAll(sel));
function on(sel, ev, fn, ctx = root()) { const el = $(sel, ctx); if (el) el.addEventListener(ev, fn); return el; }

/* Cluster theming — unified gold / red / garnet (silver-carbon ground) */
const CLUSTER = {
  spike:    { color: "var(--red)",    glow: "neon-red",    btn: "btn--red",    quote: "red",    icon: "flame" },
  vacuum:   { color: "var(--gold)",   glow: "neon-gold",   btn: "btn--gold",   quote: "",       icon: "wind" },
  judgment: { color: "var(--garnet)", glow: "neon-garnet", btn: "btn--garnet", quote: "garnet", icon: "scale" },
};

/* ── Shell + shared fragments ──────────────────────────────────────────── */

function topbar(title) {
  return `
    <div class="topbar">
      <button class="back" data-back>${icon("chevronLeft", 16)} back</button>
      ${title ? `<div class="eyebrow">${esc(title)}</div>` : ""}
      <div class="spacer-12"></div>
    </div>`;
}

function stepDots(current, total) {
  let s = "";
  for (let i = 0; i < total; i++) {
    const cls = i === current ? "dot active" : i < current ? "dot done" : "dot idle";
    s += `<div class="${cls}"></div>`;
  }
  return `<div class="dots">${s}</div>`;
}

function wireBack(fn) { const b = $("[data-back]"); if (b) b.addEventListener("click", fn); }

/* ════════════════════════════════════════════════════════════════════════
   AUDIO ENGINE — synthesized peaceful contemporary guitar + ending chime.
   No external files: fully offline, no licensing. Started by user gesture.
════════════════════════════════════════════════════════════════════════ */

const AudioEngine = (() => {
  let ctx = null, master, dry, delay, running = false, schedId = null, nextTime = 0, step = 0;

  const BEAT = 0.52; // seconds per arpeggio note (~slow, contemplative)
  // I–V–vi–IV in D: gentle, contemporary. Each chord = ascending fingerpick.
  const chords = [
    [50, 57, 62, 66, 69], // D
    [45, 52, 57, 61, 64], // A
    [47, 54, 59, 62, 66], // Bm
    [43, 50, 55, 59, 62], // G
  ];
  const pattern = [0, 1, 2, 3, 4, 3, 2, 1]; // 8 plucks per chord
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.0001; master.connect(ctx.destination);
    dry = ctx.createGain(); dry.gain.value = 0.9; dry.connect(master);
    delay = ctx.createDelay(1.0); delay.delayTime.value = 0.34;
    const fb = ctx.createGain(); fb.gain.value = 0.33;
    const damp = ctx.createBiquadFilter(); damp.type = "lowpass"; damp.frequency.value = 2100;
    const wet = ctx.createGain(); wet.gain.value = 0.5;
    delay.connect(damp); damp.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
  }

  // soft plucked-string voice (warm, fingerpicked feel)
  function pluck(freq, t, dur, vel) {
    const o1 = ctx.createOscillator(); o1.type = "triangle"; o1.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = freq * 2; o2.detune.value = 5;
    const h = ctx.createGain(); h.gain.value = 0.2; o2.connect(h);
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass";
    lp.frequency.setValueAtTime(3400, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + dur);
    o1.connect(g); h.connect(g); g.connect(lp); lp.connect(dry); lp.connect(delay);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }

  function scheduler() {
    if (!running) return;
    while (nextTime < ctx.currentTime + 0.25) {
      const chord = chords[Math.floor(step / pattern.length) % chords.length];
      const note = pattern[step % pattern.length];
      const downbeat = step % pattern.length === 0;
      pluck(mtof(chord[note]), nextTime, 2.6, downbeat ? 0.4 : 0.28);
      if (downbeat) pluck(mtof(chord[0] - 12), nextTime, 3.4, 0.3); // soft bass
      nextTime += BEAT;
      step += 1;
    }
    schedId = setTimeout(scheduler, 60);
  }

  function start() {
    try {
      if (!ctx) build();
      if (ctx.state === "suspended") ctx.resume();
      running = true; step = 0; nextTime = ctx.currentTime + 0.12;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.32, ctx.currentTime + 2.5); // gentle fade-in
      scheduler();
    } catch (e) { console.warn("audio start failed", e); }
  }

  function stop(fade = 1.2) {
    running = false;
    if (schedId) { clearTimeout(schedId); schedId = null; }
    if (ctx && master) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + fade);
    }
  }

  // Warm bell — rings out when the timer completes, audible over the fade.
  function chime() {
    try {
      if (!ctx) build();
      if (ctx.state === "suspended") ctx.resume();
      const t0 = ctx.currentTime + 0.1;
      const notes = [69, 73, 76, 81]; // A C# E A — a gentle rising resolution
      notes.forEach((m, i) => bell(mtof(m), t0 + i * 0.26));
    } catch (e) {}
  }
  function bell(freq, t) {
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = freq * 2.01;
    const h = ctx.createGain(); h.gain.value = 0.28; o2.connect(h);
    const g = ctx.createGain(); o.connect(g); h.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.42, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
    o.start(t); o2.start(t); o.stop(t + 2.9); o2.stop(t + 2.9);
  }

  return { start, stop, chime, isRunning: () => running };
})();

/* ── Screen Wake Lock (keep the screen on during the stillness timer) ──── */

const Wake = (() => {
  let sentinel = null, want = false;
  async function request() {
    want = true;
    try { if ("wakeLock" in navigator) sentinel = await navigator.wakeLock.request("screen"); }
    catch (e) {}
  }
  function release() {
    want = false;
    try { if (sentinel) { sentinel.release(); sentinel = null; } } catch (e) {}
  }
  document.addEventListener("visibilitychange", async () => {
    if (want && document.visibilityState === "visible") { try { sentinel = await navigator.wakeLock.request("screen"); } catch (e) {} }
  });
  return { request, release };
})();

/* ════════════════════════════════════════════════════════════════════════
   NOTIFICATIONS — built-in VAPID, customizable reminders (iOS-aware).
════════════════════════════════════════════════════════════════════════ */

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}
function isiOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

const Notifs = {
  supported() { return "Notification" in window && "serviceWorker" in navigator; },
  permission() { return this.supported() ? Notification.permission : "unsupported"; },
  async enable() {
    if (!this.supported()) return { ok: false, reason: "unsupported" };
    let perm = Notification.permission;
    if (perm !== "granted") perm = await Notification.requestPermission();
    if (perm !== "granted") return { ok: false, reason: "denied", perm };
    let sub = null;
    try {
      const reg = await navigator.serviceWorker.ready;
      if ("PushManager" in window) {
        sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
          });
        }
        LS.setItem("pushsub", JSON.stringify(sub));
      }
    } catch (e) { /* On iOS, push subscription only works once installed to Home Screen. */ }
    return { ok: true, perm, sub };
  },
  async test(message) {
    if (this.permission() !== "granted") return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification("The Drill", {
        body: message || "I am here, Lord.",
        icon: "./assets/icon-192.png",
        badge: "./assets/icon-192.png",
        tag: "drill-test",
        vibrate: [120, 60, 120],
      });
      return true;
    } catch (e) { return false; }
  },
  subscriptionJSON() { return LS.getItem("pushsub") || ""; },
};

/* Best-effort in-app reminder: while the app is open, fire a local
   notification at the configured time. (Real background delivery needs the
   installed PWA + the included push workflow — see README.) */
const Reminder = (() => {
  let timer = null;
  function clear() { if (timer) { clearTimeout(timer); timer = null; } }
  function schedule() {
    clear();
    const n = loadNotif();
    if (!n.enabled || Notifs.permission() !== "granted") return;
    const [h, m] = (n.time || "07:30").split(":").map(Number);
    const now = new Date();
    const next = new Date();
    next.setHours(h, m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const ms = Math.min(next - now, 2 ** 31 - 1);
    timer = setTimeout(async () => {
      await Notifs.test(n.message);
      schedule();
    }, ms);
  }
  return { schedule, clear };
})();

/* ════════════════════════════════════════════════════════════════════════
   ROUTER
════════════════════════════════════════════════════════════════════════ */

const App = {
  completedCluster: null,
  go(route) {
    AudioEngine.stop(0.3); Wake.release();
    window.scrollTo(0, 0);
    SCREENS[route] ? SCREENS[route]() : SCREENS.home();
  },
  done(cluster) { this.completedCluster = cluster; this.go("complete"); },
};

/* ════════════════════════════════════════════════════════════════════════
   SCREENS
════════════════════════════════════════════════════════════════════════ */

const SCREENS = {};

/* ── HOME ──────────────────────────────────────────────────────────────── */

SCREENS.home = function () {
  const count = loadDrills().length;
  const tile = (c, label, sub) => `
    <button class="card card-tap tile" data-go="${c}">
      <span class="tile-ico" style="background:color-mix(in srgb, ${CLUSTER[c].color} 14%, transparent); color:${CLUSTER[c].color}">${icon(CLUSTER[c].icon)}</span>
      <span class="tile-body"><span class="tile-title display">${label}</span><span class="tile-sub">${sub}</span></span>
      <span class="tile-arrow">→</span>
    </button>`;

  root().innerHTML = `
    <div style="padding:1.5rem 0 2.5rem">
      <div class="eyebrow" style="letter-spacing:.35em;margin-bottom:.4rem">The Drill</div>
      <div class="display sz-3xl chrome-text" style="line-height:1.1">Pre-rehearsed.<br/>Not fire-time decisions.</div>
      <div class="sz-xs muted mt-4 tracking">Marker · <span class="neon-gold">${MARKER_DATE}</span></div>
    </div>

    <div class="list mb-8">
      ${tile("spike", "Spike", "Lust · stress · anxiety · hate")}
      ${tile("vacuum", "Vacuum", "Empty gap · cruise · drift")}
      ${tile("judgment", "Judgment", "Shame · self-hate · “I deserve this”")}
    </div>

    <button class="linkbtn tborder" data-go="triage">Not sure which one? →</button>

    <div class="botnav">
      <button class="navbtn" data-go="history">${icon("history", 16)}<span class="navbtn-label">Log</span><span class="navbtn-sub">${count}</span></button>
      <button class="navbtn" data-go="sos">${icon("alert", 16)}<span class="navbtn-label">SOS</span></button>
      <button class="navbtn" data-go="settings">${icon("settings", 16)}<span class="navbtn-label">Settings</span></button>
    </div>`;

  $$("[data-go]").forEach((b) => b.addEventListener("click", () => App.go(b.dataset.go)));
};

/* ── TRIAGE ────────────────────────────────────────────────────────────── */

SCREENS.triage = function () {
  let q = 0;
  const questions = [
    {
      prompt: "What does the moment feel like in your body?",
      options: [
        { label: "A sharp pull. Demanding action right now.", next: "spike" },
        { label: "An emptiness or a smooth drift.", next: 1 },
        { label: "A voice in my own head accusing me.", next: "judgment" },
      ],
    },
    {
      prompt: "Are things going badly or going well?",
      options: [
        { label: "Badly — bored, lonely, tired, off.", next: "vacuum" },
        { label: "Well — and that's part of why it's suspicious.", next: "vacuum" },
      ],
    },
  ];
  function paint() {
    const cur = questions[q];
    root().innerHTML = `
      ${topbar("Triage")}
      <div class="pt-4 fade-in">
        <div class="display sz-2xl mb-10" style="line-height:1.25">${esc(cur.prompt)}</div>
        <div class="list">
          ${cur.options.map((o, i) => `<button class="card card-tap" style="padding:1.15rem" data-opt="${i}"><span class="serif">${esc(o.label)}</span></button>`).join("")}
        </div>
      </div>`;
    wireBack(() => App.go("home"));
    $$("[data-opt]").forEach((b) => b.addEventListener("click", () => {
      const nx = cur.options[+b.dataset.opt].next;
      if (typeof nx === "string") App.go(nx); else { q = nx; paint(); }
    }));
  }
  paint();
};

/* ── SPIKE DRILL — Surrender → Stillness → Gratitude ───────────────────────
   (Push-ups removed. The drill's action is now: lie down, hand on heart,
   a 5-minute stillness with peaceful guitar, then the closing prayer aloud.)
─────────────────────────────────────────────────────────────────────────── */

SCREENS.spike = function () {
  let step = 0;
  const start = Date.now();
  // timer state
  const TOTAL = 300; // 5 minutes
  let remaining = TOTAL, ticking = false, raf = null, endAt = 0, completed = false;

  function finish() {
    logDrill({ cluster: "spike", stillnessSec: TOTAL, durationMs: Date.now() - start });
    App.done("spike");
  }

  function fmt(sec) {
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function paint() {
    let body = "";
    if (step === 0) {
      body = `
        <div class="kicker neon-red">Surrender · Step 1 of 4</div>
        <div class="display sz-3xl mb-12" style="line-height:1.2">Phone down.<br/>Lie down.<br/><span class="neon-red">Hand on your heart.</span></div>
        <button class="btn btn--red" data-next>I'm lying down</button>`;
    } else if (step === 1) {
      body = `
        <div class="kicker neon-red">Surrender · Step 2 of 4</div>
        <div class="sz-sm muted mb-6 tracking">Say it out loud, or whispered.</div>
        <div class="display sz-2xl italic mb-8 leading">“God, be merciful to me, a sinner.”</div>
        <div class="ref mb-10">Luke 18:13</div>
        <button class="btn btn--red" data-next>Said</button>`;
    } else if (step === 2) {
      const pct = 1 - remaining / TOTAL;
      const R = 110, C = 2 * Math.PI * R;
      body = `
        <div class="kicker neon-red">Stillness · Step 3 of 4</div>
        <div class="sz-sm muted mb-2 tracking leading">Hand on your heart. Let it rise and fall. Be still and know.</div>
        <div class="timer-wrap">
          <div class="timer-ring">
            <svg width="240" height="240" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="${R}" fill="none" stroke="var(--line-2)" stroke-width="8"/>
              <circle class="glow-ring-gold" cx="120" cy="120" r="${R}" fill="none" stroke="var(--gold)" stroke-width="8"
                stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}" data-ring/>
              <g transform="translate(120 120)" fill="var(--red)" class="heart-pulse" ${ticking ? "" : 'style="animation:none"'}>
                <path transform="translate(-9 -8) scale(.75)" d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
              </g>
            </svg>
            <div class="digits">
              <div class="timer-time" data-time style="margin-top:2.4rem">${fmt(remaining)}</div>
              <div class="timer-caption" data-cap>${completed ? "complete" : ticking ? "be still" : "5 minutes"}</div>
            </div>
          </div>
        </div>
        ${completed
          ? `<button class="btn btn--red fade-in" data-next>Continue</button>`
          : `<div class="btn-row">
               <button class="btn btn--ghost" data-toggle>${ticking ? "Pause" : remaining < TOTAL ? "Resume" : "Begin stillness"}</button>
               <button class="btn btn--ghost" data-skip>Skip</button>
             </div>
             <div class="sz-xs faint center mt-4">Peaceful guitar plays while the timer runs. A chime sounds when it ends.</div>`}`;
    } else {
      body = `
        <div class="kicker neon-red">Gratitude · Step 4 of 4</div>
        <div class="sz-sm muted mb-6 tracking">Out loud. The prayer to St. Michael the Archangel.</div>
        <div class="display sz-2xl italic mb-8 leading">“I am here, Lord.<br/>Thank you for saving me.<br/>Please guard me against all evil.”</div>
        <div class="quote red mb-8 fade-in">
          <div class="quote-text">“Fix our eyes not on what is seen but unseen — what is seen is temporary, what is unseen is eternal.”</div>
          <div class="ref mt-2">2 Corinthians 4:18</div>
        </div>
        <div class="sz-sm muted mb-10 tracking leading">The moment doesn't terminate in “look what I just did.” It ends Godward.</div>
        <button class="btn btn--red" data-next>Drill complete</button>`;
    }

    root().innerHTML = topbar("Spike") + stepDots(step, 4) + `<div class="pt-2 fade-in">${body}</div>`;
    wireBack(() => App.go("home"));
    wireStep();
  }

  function tick() {
    remaining = Math.max(0, (endAt - Date.now()) / 1000);
    const C = 2 * Math.PI * 110;
    const ring = $("[data-ring]"); if (ring) ring.setAttribute("stroke-dashoffset", String(C * (remaining / TOTAL)));
    const t = $("[data-time]"); if (t) t.textContent = fmt(remaining);
    if (remaining <= 0) { timerComplete(); return; }
    raf = requestAnimationFrame(tick);
  }
  function timerComplete() {
    ticking = false; completed = true;
    if (raf) cancelAnimationFrame(raf);
    AudioEngine.stop(2.2);
    AudioEngine.chime();
    Wake.release();
    try { if (navigator.vibrate) navigator.vibrate([200, 90, 200, 90, 200]); } catch (e) {}
    paint();
  }
  function startTimer() {
    ticking = true;
    endAt = Date.now() + remaining * 1000;
    AudioEngine.start();
    Wake.request();
    paint();
    raf = requestAnimationFrame(tick);
  }
  function pauseTimer() {
    ticking = false;
    if (raf) cancelAnimationFrame(raf);
    AudioEngine.stop(0.6);
    Wake.release();
    paint();
  }

  function wireStep() {
    const next = $("[data-next]");
    if (next) next.addEventListener("click", () => {
      if (step === 3) return finish();
      step += 1; remaining = TOTAL; completed = false; paint();
    });
    const tg = $("[data-toggle]"); if (tg) tg.addEventListener("click", () => ticking ? pauseTimer() : startTimer());
    const sk = $("[data-skip]"); if (sk) sk.addEventListener("click", () => { if (raf) cancelAnimationFrame(raf); AudioEngine.stop(0.4); Wake.release(); timerComplete(); });
  }

  paint();
};

/* ── VACUUM DRILL — Name → Connect → Anchor ────────────────────────────── */

SCREENS.vacuum = function () {
  let step = 0, subtype = null, showPsalm = false, anchor = "";
  const start = Date.now();
  const s = loadSettings();

  function finish() {
    logDrill({ cluster: "vacuum", subtype, anchor, durationMs: Date.now() - start });
    App.done("vacuum");
  }

  function contact(name, role, phone) {
    return `
      <a class="card card-tap tile reset" href="${phone ? `tel:${esc(phone)}` : "#"}">
        <span class="tile-ico" style="background:color-mix(in srgb, var(--gold) 14%, transparent);color:var(--gold)">${icon("phone", 16)}</span>
        <span class="tile-body"><span class="tile-title">${esc(name)}</span><span class="tile-sub">${esc(role)}</span></span>
        ${phone ? "" : '<span class="sz-xs faint" style="text-transform:uppercase;letter-spacing:.1em">Set in Settings</span>'}
      </a>`;
  }

  function paint() {
    let body = "";
    if (step === 0) {
      body = `
        <div class="kicker neon-gold">Name · Step 1 of 4</div>
        <div class="display sz-2xl mb-3" style="line-height:1.25">Name it out loud.</div>
        <div class="sz-sm muted mb-10 leading">Naming is dominion. Adam named the animals. Jesus asked the demon its name before casting it out.</div>
        <div class="list">
          <button class="card card-tap" style="padding:1.15rem" data-sub="empty">
            <div class="serif italic">“I'm in a vacuum right now.”</div>
            <div class="sz-xs muted mt-2">Empty · bored · lonely · tired</div>
          </button>
          <button class="card card-tap" style="padding:1.15rem" data-sub="cruise">
            <div class="serif italic">“I'm in a cruise right now.”</div>
            <div class="sz-xs muted mt-2">Going well · autopilot · vigilance dulling</div>
          </button>
        </div>`;
    } else if (step === 1) {
      const psalm = subtype === "cruise" ? PSALM_103_OPENING : PSALM_51_OPENING;
      const psalmName = subtype === "cruise" ? "Psalm 103" : "Psalm 51";
      body = `
        <div class="kicker neon-gold">Connect · Step 2 of 4</div>
        <div class="sz-sm muted mb-2 tracking">Two parts. Out loud or silent.</div>
        <div class="mt-6 mb-8">
          <div class="quote-label">Gratitude</div>
          <div class="serif italic sz-xl leading mb-6">“God, things are going well and I see your hand in it.”</div>
          <div class="quote-label">Petition</div>
          <div class="serif italic sz-xl leading">“Keep me on this track. Keep my foundations sharp. Don't let me drift.”</div>
        </div>
        ${!showPsalm
          ? `<button class="btn btn--gold mb-2" data-next>Said · continue</button>
             <button class="linkbtn" data-psalm>${icon("book", 14)} &nbsp;Read ${psalmName}</button>`
          : `<div class="card fade-in mb-4" style="padding:1.25rem">
               <div class="quote-label mb-3">${psalmName}</div>
               <div class="scrollbox preline serif sz-sm leading">${esc(psalm)}</div>
             </div>
             <button class="btn btn--gold" data-next>Continue</button>`}`;
    } else if (step === 2) {
      body = `
        <div class="kicker neon-gold">Connect · Step 3 of 4</div>
        <div class="display sz-2xl mb-3" style="line-height:1.25">Call or text someone.</div>
        <div class="sz-sm muted mb-8 leading">The catch-up forces you to narrate your life back to yourself out loud. Surfaces the drift to your own awareness.</div>
        <div class="list">
          ${contact(s.momName || "Mom", "When you need to receive", s.momPhone)}
          ${contact(s.sydneyName || "Sydney", "When you need to give too", s.sydneyPhone)}
        </div>
        <div class="mt-8"><button class="btn btn--gold" data-next>Done · continue</button></div>`;
    } else {
      body = `
        <div class="kicker neon-gold">Anchor · Step 4 of 4</div>
        <div class="display sz-xl mb-3" style="line-height:1.3">One line.</div>
        <div class="sz-sm muted mb-6 leading">“Today I noticed the ${esc(subtype || "vacuum")}. Here's what I'm grateful for:”</div>
        <textarea class="inp mb-6" data-anchor rows="3" placeholder="One thing.">${esc(anchor)}</textarea>
        <div class="quote mb-6">
          <div class="quote-label">Deuteronomy 8:17 · taped to the inside</div>
          <div class="quote-text sz-sm">“Beware lest you say in your heart, ‘My power and the might of my hand have gotten me this wealth.’”</div>
        </div>
        <button class="btn btn--gold" data-next ${anchor.trim() ? "" : "disabled"}>Drill complete</button>`;
    }
    root().innerHTML = topbar("Vacuum") + stepDots(step, 4) + `<div class="pt-2 fade-in">${body}</div>`;
    wireBack(() => App.go("home"));
    wire();
  }

  function wire() {
    $$("[data-sub]").forEach((b) => b.addEventListener("click", () => { subtype = b.dataset.sub; step = 1; paint(); }));
    const ps = $("[data-psalm]"); if (ps) ps.addEventListener("click", () => { showPsalm = true; paint(); });
    const ta = $("[data-anchor]");
    if (ta) ta.addEventListener("input", (e) => {
      anchor = e.target.value;
      const nx = $("[data-next]"); if (nx) nx.disabled = !anchor.trim();
    });
    const nx = $("[data-next]");
    if (nx) nx.addEventListener("click", () => {
      if (step === 3) return finish();
      if (step === 1 || step === 2) { step += 1; showPsalm = false; paint(); }
    });
  }

  paint();
};

/* ── JUDGMENT DRILL — Interrupt → Overrule → Anchor ────────────────────── */

SCREENS.judgment = function () {
  let step = 0, taps = 0, verseShown = 0;
  const start = Date.now();
  const verses = [
    { label: "Verdict", ref: "Romans 8:1", text: "There is therefore now no condemnation for those who are in Christ Jesus." },
    { label: "Mechanism", ref: "1 John 1:9", text: "If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness." },
    { label: "Image", ref: "Psalm 103:12", text: "As far as the east is from the west, so far has he removed our transgressions from us." },
  ];

  function finish() {
    logDrill({ cluster: "judgment", taps, durationMs: Date.now() - start });
    App.done("judgment");
  }

  function paint() {
    let body = "";
    if (step === 0) {
      body = `
        <div class="kicker neon-garnet">Interrupt · Step 1 of 3</div>
        <div class="sz-sm muted mb-6 tracking">Hand on chest. Say it out loud. Tap to mark each time.</div>
        <button class="bigpress garnet" data-tap style="margin:1.25rem 0">
          <div class="display" style="font-size:1.7rem;letter-spacing:.04em;margin-bottom:.4rem">THE CASE IS CLOSED</div>
          <div style="font-size:.6rem;letter-spacing:.3em;opacity:.7" data-taps>TAPPED ${taps} ${taps === 1 ? "TIME" : "TIMES"}</div>
        </button>
        <div class="sz-xs muted italic center serif mb-8">“The Judge is trying to re-open a case God has already closed.”</div>
        <button class="btn btn--garnet" data-next ${taps < 1 ? "disabled" : ""}>Continue</button>`;
    } else if (step === 1) {
      body = `
        <div class="kicker neon-garnet">Overrule · Step 2 of 3</div>
        <div class="sz-sm muted mb-2 tracking">Verdict → Mechanism → Image</div>
        <div class="list mt-8 mb-2" style="min-height:18rem">
          ${verses.slice(0, verseShown + 1).map((v) => `
            <div class="quote garnet fade-in">
              <div class="quote-label" style="color:var(--garnet)">${v.label}</div>
              <div class="quote-text">“${v.text}”</div>
              <div class="ref mt-2">${v.ref}</div>
            </div>`).join("")}
        </div>
        ${verseShown < 2
          ? `<button class="btn btn--garnet" data-verse>Next verse</button>`
          : `<button class="btn btn--garnet" data-next>Continue</button>`}`;
    } else {
      body = `
        <div class="kicker neon-garnet">Anchor · Step 3 of 3</div>
        <div class="sz-sm muted mb-6 tracking">Say it out loud. Close Godward.</div>
        <div class="display sz-3xl italic mb-10" style="line-height:1.2">“Thank you, God,<br/>for the cross.”</div>
        <div class="quote garnet mb-8">
          <div class="quote-label">The line to remember</div>
          <div class="quote-text sz-sm">“I deserved the electric chair. Jesus took it. I am free, and the freedom is not something I earn by suffering for it longer.”</div>
        </div>
        <button class="btn btn--garnet" data-next>Drill complete</button>`;
    }
    root().innerHTML = topbar("Judgment") + stepDots(step, 3) + `<div class="pt-2 fade-in">${body}</div>`;
    wireBack(() => App.go("home"));
    wire();
  }

  function wire() {
    const tp = $("[data-tap]");
    if (tp) tp.addEventListener("click", () => {
      taps += 1;
      const t = $("[data-taps]"); if (t) t.textContent = `TAPPED ${taps} ${taps === 1 ? "TIME" : "TIMES"}`;
      const nx = $("[data-next]"); if (nx) nx.disabled = false;
      try { if (navigator.vibrate) navigator.vibrate(15); } catch (e) {}
    });
    const vs = $("[data-verse]"); if (vs) vs.addEventListener("click", () => { verseShown += 1; paint(); });
    const nx = $("[data-next]");
    if (nx) nx.addEventListener("click", () => {
      if (step === 2) return finish();
      step += 1; paint();
    });
  }

  paint();
};

/* ── COMPLETE ──────────────────────────────────────────────────────────── */

SCREENS.complete = function () {
  const c = App.completedCluster || "spike";
  const color = CLUSTER[c].color;
  root().innerHTML = `
    <div class="center" style="padding-top:6rem">
      <div class="check-orb" style="background:color-mix(in srgb, ${color} 16%, transparent);color:${color};box-shadow:0 0 28px color-mix(in srgb, ${color} 40%, transparent)">${icon("check", 30)}</div>
      <div class="display sz-2xl mb-3">Logged.</div>
      <div class="sz-sm muted leading mb-12" style="padding:0 1rem">The record is the answer to the Judge later.<br/>Navigate by the record, not the feeling.</div>
      <button class="btn btn--silver" data-home>Home</button>
    </div>`;
  on("[data-home]", "click", () => App.go("home"));
};

/* ── HISTORY ───────────────────────────────────────────────────────────── */

SCREENS.history = function () {
  const drills = loadDrills();
  const by = drills.reduce((a, d) => ((a[d.cluster] = (a[d.cluster] || 0) + 1), a), {});
  const stat = (c) => `
    <div class="card stat">
      <div style="color:${CLUSTER[c].color}">${icon(CLUSTER[c].icon, 14)}</div>
      <div class="stat-num">${by[c] || 0}</div>
      <div class="stat-label">${c}</div>
    </div>`;

  const rows = drills.map((d) => {
    const cl = CLUSTER[d.cluster] || CLUSTER.spike;
    const when = new Date(d.ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    return `
      <div class="card row" style="border-color:${cl.color}">
        <div class="row-top">
          <div class="row-cluster" style="color:${cl.color}">${icon(cl.icon, 14)} ${d.cluster}${d.subtype ? ` <span class="muted">· ${esc(d.subtype)}</span>` : ""}</div>
          <div class="row-time">${when}</div>
        </div>
        ${d.anchor ? `<div class="serif italic sz-sm mt-2">“${esc(d.anchor)}”</div>` : ""}
        ${d.stillnessSec ? `<div class="sz-xs muted mt-2">${Math.round(d.stillnessSec / 60)} min stillness</div>` : ""}
        ${d.taps ? `<div class="sz-xs muted mt-2">case closed ×${d.taps}</div>` : ""}
      </div>`;
  }).join("");

  root().innerHTML = `
    ${topbar("Log")}
    <div class="pt-2">
      <div class="sz-sm muted mb-2 tracking">The record. ${drills.length} ${drills.length === 1 ? "entry" : "entries"} since ${MARKER_DATE}.</div>
      <div class="stats mt-6 mb-6">${stat("spike")}${stat("vacuum")}${stat("judgment")}</div>
      <button class="card card-tap tile" data-go="siren" style="margin-bottom:1.5rem">
        <span style="color:var(--gold)">${icon("heart", 16)}</span>
        <span class="tile-body"><span class="sz-sm">Ranking Siren · weekly check</span><span class="tile-sub">Is the system producing dependence or hierarchy?</span></span>
        <span class="tile-arrow">→</span>
      </button>
      <div class="list">
        ${drills.length === 0 ? `<div class="sz-sm muted center serif italic" style="padding:2rem 0">No drills logged yet.</div>` : rows}
      </div>
    </div>`;
  wireBack(() => App.go("home"));
  on("[data-go]", "click", () => App.go("siren"));
};

/* ── RANKING SIREN ─────────────────────────────────────────────────────── */

SCREENS.siren = function () {
  const questions = [
    "Am I ranking myself against others or against a previous version of me?",
    "Is the streak count starting to feel like credit I've banked?",
    "When I miss a drill, is the dominant feeling shame — or recalibration?",
  ];
  let answers = {}, showResult = false;

  function paint() {
    let body;
    if (!showResult) {
      body = `
        <div class="sz-sm muted mb-2 tracking leading">Self-righteousness produces hierarchy. Spiritual growth produces dependence. Check the direction.</div>
        <div class="mt-8 list" style="gap:1.5rem">
          ${questions.map((q, i) => `
            <div>
              <div class="serif mb-3" style="line-height:1.3">${esc(q)}</div>
              <div class="yn">
                <button data-ans="${i}" data-val="yes" class="${answers[i] === "yes" ? "sel" : ""}">Yes</button>
                <button data-ans="${i}" data-val="no" class="${answers[i] === "no" ? "sel" : ""}">No</button>
              </div>
            </div>`).join("")}
        </div>
        <div class="mt-8"><button class="btn btn--silver" data-result ${Object.keys(answers).length < 3 ? "disabled" : ""}>See result</button></div>`;
    } else {
      const flag = Object.values(answers).filter((a) => a === "yes").length;
      body = flag === 0 ? `
        <div class="pt-8 fade-in">
          <div class="kicker neon-gold">Clear</div>
          <div class="display sz-2xl mb-4" style="line-height:1.25">No siren. The system is producing dependence.</div>
          <div class="sz-sm muted leading">Keep going. Check again next week.</div>
        </div>` : `
        <div class="pt-8 fade-in">
          <div class="kicker neon-red">Siren · ${flag} ${flag === 1 ? "flag" : "flags"}</div>
          <div class="display sz-2xl mb-4" style="line-height:1.25">Watch the ranking.</div>
          <div class="sz-sm muted leading mb-6">The drills are starting to wear the Pharisee costume. Bring this to the next Foundations conversation. Don't try to fix it alone — that's the same operating system that produced the problem.</div>
          <div class="quote"><div class="quote-text sz-sm">“Humility isn't a feeling. It's an accurate self-assessment of my actual capacities.”</div></div>
        </div>`;
    }
    root().innerHTML = topbar("Ranking Siren") + `<div class="pt-2">${body}</div>`;
    wireBack(() => App.go("history"));
    $$("[data-ans]").forEach((b) => b.addEventListener("click", () => { answers[b.dataset.ans] = b.dataset.val; paint(); }));
    const r = $("[data-result]"); if (r) r.addEventListener("click", () => { showResult = true; paint(); });
  }
  paint();
};

/* ── SOS ───────────────────────────────────────────────────────────────── */

SCREENS.sos = function () {
  const s = loadSettings();
  const contact = (name, role, phone) => `
    <a class="card card-tap tile reset" href="${phone ? `tel:${esc(phone)}` : "#"}">
      <span class="tile-ico" style="background:color-mix(in srgb, var(--garnet) 14%, transparent);color:var(--garnet)">${icon("phone", 16)}</span>
      <span class="tile-body"><span class="tile-title">${esc(name)}</span><span class="tile-sub">${esc(role)}</span></span>
      ${phone ? "" : '<span class="sz-xs faint" style="text-transform:uppercase;letter-spacing:.1em">Set in Settings</span>'}
    </a>`;

  root().innerHTML = `
    ${topbar("SOS")}
    <div class="pt-2">
      <div class="display sz-2xl mb-2" style="line-height:1.25">One tap.</div>
      <div class="sz-sm muted mb-10 leading">God first — silently, right now. Then one of these.</div>
      <div class="list">
        <a class="sos-988" href="tel:988">
          ${icon("phone", 20)}
          <div style="flex:1"><div style="font-size:1.15rem">988</div><div class="sz-xs" style="opacity:.8">Suicide &amp; Crisis Lifeline</div></div>
        </a>
        ${contact(s.momName || "Mom", "When you need to receive", s.momPhone)}
        ${contact(s.sydneyName || "Sydney", "When you need to give too", s.sydneyPhone)}
      </div>
      <div class="quote silver mt-12">
        <div class="quote-text sz-sm">“God, be merciful to me, a sinner.”</div>
        <div class="ref mt-2">Luke 18:13</div>
      </div>
    </div>`;
  wireBack(() => App.go("home"));
};

/* ── SETTINGS (contacts + notifications) ───────────────────────────────── */

SCREENS.settings = function () {
  let s = loadSettings();
  let n = loadNotif();
  let saved = false;

  function notifStatus() {
    const perm = Notifs.permission();
    if (perm === "unsupported") return "Notifications aren't supported in this browser.";
    if (perm === "granted") return isStandalone() ? "Enabled on this device." : "Allowed. Install to Home Screen for reliable delivery.";
    if (perm === "denied") return "Blocked. Enable notifications for The Drill in iOS Settings.";
    return isiOS() && !isStandalone()
      ? "On iPhone: tap Share → Add to Home Screen, open from the icon, then enable."
      : "Tap enable, then allow notifications.";
  }

  function paint() {
    root().innerHTML = `
      ${topbar("Settings")}
      <div class="pt-2 list" style="gap:1.75rem">
        <div>
          <div class="quote-label mb-3">Contacts</div>
          <div class="list" style="gap:1rem">
            <div><div class="field-label">Name 1</div><input class="inp" data-f="momName" value="${esc(s.momName)}" /></div>
            <div><div class="field-label">Phone 1</div><input class="inp" data-f="momPhone" type="tel" inputmode="tel" value="${esc(s.momPhone)}" /></div>
            <div><div class="field-label">Name 2</div><input class="inp" data-f="sydneyName" value="${esc(s.sydneyName)}" /></div>
            <div><div class="field-label">Phone 2</div><input class="inp" data-f="sydneyPhone" type="tel" inputmode="tel" value="${esc(s.sydneyPhone)}" /></div>
          </div>
          <button class="btn btn--silver mt-6" data-save>${saved ? "Saved ✓" : "Save contacts"}</button>
        </div>

        <div style="border-top:1px solid var(--line);padding-top:1.5rem">
          <div class="quote-label mb-3">Daily reminder</div>
          <div class="card" style="padding:1.1rem">
            <div style="display:flex;align-items:center;gap:1rem">
              <span style="color:var(--gold)">${icon("bell", 18)}</span>
              <div style="flex:1"><div class="sz-sm">Reminder notification</div><div class="sz-xs faint" data-status>${notifStatus()}</div></div>
              <label class="switch"><input type="checkbox" data-enable ${n.enabled ? "checked" : ""}/><span class="slider"></span></label>
            </div>
            <div class="${n.enabled ? "" : "hidden"}" data-notifbody>
              <div style="border-top:1px solid var(--line);margin-top:1rem;padding-top:1rem">
                <div class="field-label">Time</div>
                <input class="inp" data-time type="time" value="${esc(n.time)}" />
                <div class="field-label mt-4">Message</div>
                <textarea class="inp" data-msg rows="2">${esc(n.message)}</textarea>
                <button class="btn btn--ghost mt-4" data-test>Send a test notification</button>
              </div>
            </div>
          </div>
          <div class="sz-xs faint mt-3 leading">iOS delivers web notifications only after the app is added to the Home Screen (iOS 16.4+). Built-in VAPID keys are included for push — see the project README to schedule daily reminders.</div>
        </div>

        <div style="border-top:1px solid var(--line);padding-top:1.5rem">
          <div class="sz-xs muted italic serif leading">“Marker date: ${MARKER_DATE}. First day the rebuild actually began. Navigate by this point.”</div>
        </div>
      </div>`;
    wireBack(() => App.go("home"));
    wire();
  }

  function wire() {
    $$("[data-f]").forEach((inp) => inp.addEventListener("input", (e) => { s[e.target.dataset.f] = e.target.value; saved = false; }));
    on("[data-save]", "click", () => { saveSettings(s); saved = true; const b = $("[data-save]"); if (b) b.textContent = "Saved ✓"; setTimeout(() => { const b2 = $("[data-save]"); if (b2) b2.textContent = "Save contacts"; }, 1500); });

    on("[data-enable]", "change", async (e) => {
      if (e.target.checked) {
        const res = await Notifs.enable();
        if (!res.ok) { e.target.checked = false; n.enabled = false; }
        else { n.enabled = true; }
      } else { n.enabled = false; }
      saveNotif(n); Reminder.schedule();
      const body = $("[data-notifbody]"); if (body) body.classList.toggle("hidden", !n.enabled);
      const st = $("[data-status]"); if (st) st.textContent = notifStatus();
    });
    on("[data-time]", "change", (e) => { n.time = e.target.value; saveNotif(n); Reminder.schedule(); });
    on("[data-msg]", "input", (e) => { n.message = e.target.value; saveNotif(n); });
    on("[data-test]", "click", async (e) => {
      const ok = await Notifs.test(n.message);
      e.target.textContent = ok ? "Sent ✓ — check your notifications" : "Couldn't send — allow notifications first";
      setTimeout(() => { const b = $("[data-test]"); if (b) b.textContent = "Send a test notification"; }, 2200);
    });
  }

  paint();
};

/* ════════════════════════════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════════════════════════════ */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((e) => console.warn("SW registration failed", e));
  });
}

Reminder.schedule();
App.go("home");
