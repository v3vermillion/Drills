import sharp from "sharp";
import { readFileSync } from "fs";
const svg = readFileSync(new URL("../assets/cross.svg", import.meta.url));
await sharp(svg, { density: 300 })
  .resize(1000, 1500, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(new URL("../assets/cross.png", import.meta.url).pathname);
console.log("wrote cross.png");
