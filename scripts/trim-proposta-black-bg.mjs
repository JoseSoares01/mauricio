import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const DIR = path.join(process.cwd(), "public/uploads/propostas");
const BLACK_THRESHOLD = 32;
const PADDING = 4;

function isBackgroundPixel(r, g, b, a) {
  if (a < 12) return true;
  return r <= BLACK_THRESHOLD && g <= BLACK_THRESHOLD && b <= BLACK_THRESHOLD;
}

function trimAndKnockoutBlack(png) {
  const { width, height, data } = png;

  for (let i = 0; i < data.length; i += 4) {
    if (isBackgroundPixel(data[i], data[i + 1], data[i + 2], data[i + 3])) {
      data[i + 3] = 0;
    }
  }

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (width * y + x) << 2;
      if (data[i + 3] < 12) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) return png;

  minX = Math.max(0, minX - PADDING);
  minY = Math.max(0, minY - PADDING);
  maxX = Math.min(width - 1, maxX + PADDING);
  maxY = Math.min(height - 1, maxY + PADDING);

  const newWidth = maxX - minX + 1;
  const newHeight = maxY - minY + 1;
  const trimmed = new PNG({ width: newWidth, height: newHeight });

  for (let y = 0; y < newHeight; y += 1) {
    for (let x = 0; x < newWidth; x += 1) {
      const src = ((minY + y) * width + (minX + x)) << 2;
      const dst = (y * newWidth + x) << 2;
      trimmed.data[dst] = data[src];
      trimmed.data[dst + 1] = data[src + 1];
      trimmed.data[dst + 2] = data[src + 2];
      trimmed.data[dst + 3] = data[src + 3];
    }
  }

  return trimmed;
}

function processFile(filePath) {
  const input = fs.readFileSync(filePath);
  const png = PNG.sync.read(input);
  const before = `${png.width}x${png.height}`;
  const trimmed = trimAndKnockoutBlack(png);
  fs.writeFileSync(filePath, PNG.sync.write(trimmed));
  return `${before} -> ${trimmed.width}x${trimmed.height}`;
}

const files = fs
  .readdirSync(DIR)
  .filter((name) => name.toLowerCase().endsWith(".png"))
  .map((name) => path.join(DIR, name));

for (const file of files) {
  console.log(path.basename(file), processFile(file));
}

console.log(`Done: ${files.length} images processed.`);
