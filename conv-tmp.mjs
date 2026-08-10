import sharp from "sharp";
const img = await sharp("apps/web/public/logoMuni.ico");
const meta = await img.metadata();
console.log("ICO original:", meta.width, "x", meta.height, meta.format);
await sharp("apps/web/public/logoMuni.ico")
  .resize(192, 192, { fit: "inside" })
  .png()
  .toFile("apps/web/public/logoMuni.png");
console.log("PNG creado (192px max)");
