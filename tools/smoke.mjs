/* Headless smoke test: run app.js in jsdom, walk every screen, assert content. */
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const appJs = readFileSync(new URL("../app.js", import.meta.url), "utf8");

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="app" class="wrap"></div></body></html>`, {
  runScripts: "outside-only",
  pretendToBeVisual: true,
  url: "https://example.github.io/drills/",
});
const { window } = dom;

// ── Stubs for browser APIs jsdom lacks ──
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
window.scrollTo = () => {};
window.AudioContext = class { constructor(){ this.currentTime=0; this.destination={}; this.state="running";} createGain(){return gnode();} createDelay(){return {delayTime:{value:0},connect(){}};} createBiquadFilter(){return {type:"",frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};} createOscillator(){return {type:"",frequency:{value:0},detune:{value:0},connect(){},start(){},stop(){}};} resume(){} };
function gnode(){ return { gain:{value:0,cancelScheduledValues(){},setValueAtTime(){},exponentialRampToValueAtTime(){}}, connect(){} }; }
window.requestAnimationFrame = () => 1;
window.cancelAnimationFrame = () => {};
Object.defineProperty(window.navigator, "serviceWorker", { value: { register: () => Promise.reject("no sw in test"), ready: Promise.resolve({ showNotification(){}, pushManager:{ getSubscription(){return Promise.resolve(null);}, subscribe(){return Promise.resolve({});} } }) }, configurable: true });
window.Notification = { permission: "default", requestPermission: () => Promise.resolve("default") };

const errors = [];
window.addEventListener("error", (e) => errors.push(e.error || e.message));

// run app.js
const fn = new window.Function(appJs);
try { fn.call(window); } catch (e) { console.error("THROW on load:", e); process.exit(1); }

const doc = window.document;
const app = doc.getElementById("app");
const txt = () => app.textContent;
const click = (sel) => { const el = app.querySelector(sel); if (!el) throw new Error("no element: " + sel); el.dispatchEvent(new window.Event("click", { bubbles: true })); };
const assert = (cond, msg) => { if (!cond) { console.error("FAIL:", msg); process.exitCode = 1; } else console.log("  ✓", msg); };

console.log("HOME");
assert(txt().includes("Pre-rehearsed"), "home renders headline");
assert(app.querySelector('[data-go="spike"]'), "spike tile present");

console.log("SPIKE");
click('[data-go="spike"]');
assert(txt().includes("Lie down"), "step1: lie down (not stand up)");
assert(txt().includes("Hand on your heart"), "step1: hand on heart");
click('[data-next]'); // -> step 2 prayer
assert(txt().includes("be merciful to me, a sinner"), "step2: mercy prayer");
assert(!txt().includes("Philippians"), "Phil 4:13 removed from spike");
assert(!/all things through Christ/.test(txt()), "Phil 4:13 text removed");
click('[data-next]'); // -> step 3 stillness timer
assert(txt().includes("Stillness"), "step3: stillness label");
assert(txt().includes("5 minutes") || txt().includes("5:00"), "step3: 5 minute timer");
assert(app.querySelector('[data-toggle]'), "step3: timer toggle present");
assert(!/push.?up/i.test(txt()), "no push-ups anywhere in spike");
// skip the timer to reach completion state
click('[data-skip]');
assert(app.querySelector('[data-next]'), "step3: continue appears after timer");
click('[data-next]'); // -> step 4 gratitude
assert(txt().includes("I am here, Lord"), "step4: spoken prayer present");
assert(txt().includes("guard me against all evil"), "step4: prayer full");
assert(!/michael/i.test(txt()), "step4: NO St Michael reference");
assert(txt().includes("2 Corinthians 4:18"), "step4: 2 Cor 4:18 present");
assert(txt().includes("temporary") && txt().includes("eternal"), "step4: verse text");
assert(!txt().includes("look what I just did"), "step4: push-up-era sentence removed");
click('[data-next]'); // finish -> complete
assert(txt().includes("Logged"), "spike completion logs");
assert(!txt().includes("answer to the Judge"), "complete: subtitle removed");
click('[data-home]');

console.log("VACUUM");
click('[data-go="vacuum"]');
assert(txt().includes("Name it out loud"), "vacuum step1");
click('[data-sub="empty"]');
assert(txt().includes("Gratitude"), "vacuum step2 prayer");
click('[data-psalm]');
assert(txt().includes("Have mercy on me"), "vacuum psalm 51 shows");
click('[data-next]');
assert(txt().includes("Call or text"), "vacuum step3 contacts");
click('[data-next]');
assert(txt().includes("Deuteronomy 8:17"), "vacuum step4 anchor verse");
const ta = app.querySelector('[data-anchor]'); ta.value = "His patience with me."; ta.dispatchEvent(new window.Event("input",{bubbles:true}));
assert(!app.querySelector('[data-next]').disabled, "anchor enables complete");
click('[data-next]');
assert(txt().includes("Logged"), "vacuum completion");
click('[data-home]');

console.log("JUDGMENT");
click('[data-go="judgment"]');
assert(txt().includes("THE CASE IS CLOSED"), "judgment step1");
click('[data-tap]');
assert(txt().includes("TAPPED 1 TIME"), "judgment tap counter");
click('[data-next]');
assert(txt().includes("Romans 8:1"), "judgment verse 1");
click('[data-verse]'); click('[data-verse]');
assert(txt().includes("Psalm 103:12"), "judgment verse 3");
click('[data-next]');
assert(txt().includes("Thank you, God"), "judgment anchor");
click('[data-next]');
assert(txt().includes("Logged"), "judgment completion");
click('[data-home]');

console.log("TRIAGE / HISTORY / SIREN / SOS / SETTINGS");
click('[data-go="triage"]'); assert(txt().includes("feel like in your body"), "triage renders"); click('[data-back]'); // -> home
click('[data-go="history"]'); assert(txt().includes("The record"), "history renders");
assert(txt().includes("min stillness"), "history shows stillness (spike logged)");
assert(/\b(EST|EDT|ET|GMT)\b/.test(txt()), "log shows Eastern timezone label");
assert(/20\d\d/.test(txt()), "log shows full date with year");
click('[data-go="siren"]'); assert(txt().includes("Self-righteousness"), "siren renders");
click('[data-back]'); // siren -> history
assert(txt().includes("The record"), "siren back returns to history");
click('[data-back]'); // history -> home
click('[data-go="sos"]'); assert(txt().includes("988"), "sos renders"); click('[data-back]'); // -> home
click('[data-go="settings"]'); assert(txt().includes("Daily reminder"), "settings renders");
assert(app.querySelector('[data-enable]'), "notif toggle present");

assert(errors.length === 0, "no uncaught window errors (" + errors.length + ")");
if (errors.length) console.error(errors);
console.log(process.exitCode ? "\nSMOKE TEST: FAILURES ABOVE" : "\nSMOKE TEST: ALL PASS");
