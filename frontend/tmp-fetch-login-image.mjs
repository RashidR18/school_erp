import fs from "fs";

const candidates = [
  "https://marinaenglishhighschool.com/wp-content/uploads/2025/02/Slider-1-2-300x114.png",
  "https://marinaenglishhighschool.com/wp-content/uploads/2025/02/Slider-1-2-450x171.png",
  "https://marinaenglishhighschool.com/wp-content/uploads/2025/02/Slider-1-2-600x228.png",
  "https://marinaenglishhighschool.com/wp-content/uploads/2025/02/Slider-1-2-768x292.png",
  "https://marinaenglishhighschool.com/wp-content/uploads/2025/02/Slider-1-2-1024x389.png",
  "https://marinaenglishhighschool.com/wp-content/uploads/2025/02/Slider-1-2-1200x456.png",
  "https://marinaenglishhighschool.com/wp-content/uploads/2025/02/Slider-1-2-1536x584.png",
  "https://marinaenglishhighschool.com/wp-content/uploads/2025/02/Slider-1-2-2048x778.png",
  "https://marinaenglishhighschool.com/wp-content/uploads/2025/02/Slider-1-2.png",
];

let selected = null;
let bytes = null;

for (const url of candidates) {
  try {
    const res = await fetch(url);
    if (!res.ok) continue;
    const ab = await res.arrayBuffer();
    if (!ab || ab.byteLength === 0) continue;
    selected = url;
    bytes = Buffer.from(ab);
    break;
  } catch {
    // try next candidate
  }
}

if (!selected || !bytes) {
  console.error("Could not download image from any candidate URL");
  process.exit(1);
}

fs.writeFileSync("src/assets/login-school.png", bytes);
console.log(`Saved login-school.png from ${selected} (${bytes.length} bytes)`);
