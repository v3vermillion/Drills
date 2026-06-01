import sharp from "sharp";
import { readFileSync } from "fs";

const svg = readFileSync(new URL("./icon.svg", import.meta.url));

async function render(size, out) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(new URL(`../assets/${out}`, import.meta.url).pathname);
  console.log("wrote", out, size);
}

// Maskable: scale artwork into ~80% safe zone on a solid dark field
async function maskable(size, out) {
  const inner = Math.round(size * 0.8);
  const pad = Math.round((size - inner) / 2);
  const art = await sharp(svg, { density: 384 }).resize(inner, inner).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 8, g: 8, b: 10, alpha: 1 } },
  })
    .composite([{ input: art, top: pad, left: pad }])
    .png({ compressionLevel: 9 })
    .toFile(new URL(`../assets/${out}`, import.meta.url).pathname);
  console.log("wrote", out, size, "(maskable)");
}

await render(512, "icon-512.png");
await render(192, "icon-192.png");
await render(180, "apple-touch-icon.png");
await render(32, "favicon-32.png");
await maskable(512, "icon-maskable-512.png");
await maskable(192, "icon-maskable-192.png");
