/* Send a Web Push notification to your subscribed device.
 *
 * The DRILL's client embeds the VAPID *public* key. To actually deliver a
 * push you need the matching *private* key plus this device's subscription.
 * Both are read from environment variables so nothing secret is committed:
 *
 *   VAPID_PUBLIC        (public key — same one in app.js)
 *   VAPID_PRIVATE       (private key — keep secret)
 *   DRILL_SUBSCRIPTION  (the JSON shown in the app / saved at localStorage "pushsub")
 *   DRILL_MESSAGE       (optional notification body)
 *
 * Local use:
 *   VAPID_PUBLIC=... VAPID_PRIVATE=... DRILL_SUBSCRIPTION='{...}' node tools/send-push.mjs
 */
import webpush from "web-push";

const PUBLIC = process.env.VAPID_PUBLIC;
const PRIVATE = process.env.VAPID_PRIVATE;
const SUB = process.env.DRILL_SUBSCRIPTION;
const MESSAGE = process.env.DRILL_MESSAGE || "I am here, Lord. Bring this day to God.";

if (!PUBLIC || !PRIVATE || !SUB) {
  console.log("Missing VAPID_PUBLIC / VAPID_PRIVATE / DRILL_SUBSCRIPTION — nothing to send. Skipping.");
  process.exit(0);
}

webpush.setVapidDetails("mailto:notify@thedrill.app", PUBLIC, PRIVATE);

const payload = JSON.stringify({
  title: "The Drill",
  body: MESSAGE,
  url: "./",
  tag: "drill-daily",
});

try {
  await webpush.sendNotification(JSON.parse(SUB), payload);
  console.log("Push sent.");
} catch (err) {
  console.error("Push failed:", err.statusCode || "", err.body || err.message);
  process.exit(1);
}
