import sharp from "sharp";

await sharp("src/assets/login-school.png")
  .resize({ width: 1200, withoutEnlargement: true })
  .webp({ quality: 72, effort: 4 })
  .toFile("src/assets/login-school.webp");

console.log("Created src/assets/login-school.webp");
