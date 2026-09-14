// One-shot icon generator: rounded gradient square with a white star.
// Run: node scripts/make-icons.mjs   (writes icons/icon-192.png, icon-512.png)
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

function crc32(buf) {
  let c, crc = 0xFFFFFFFF;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xFF;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function pngFromRGBA(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function starPolygon(cx, cy, outer, inner) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

function inPolygon(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function makeIcon(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const r = size * 0.2;                       // corner radius
  const star = starPolygon(size / 2, size / 2 + size * 0.02, size * 0.32, size * 0.13);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // rounded-rect mask
      const dx = Math.max(r - x, x - (size - 1 - r), 0);
      const dy = Math.max(r - y, y - (size - 1 - r), 0);
      const idx = (y * size + x) * 4;
      if (dx * dx + dy * dy > r * r) { rgba[idx + 3] = 0; continue; }
      // vertical gradient sky-blue -> violet
      const t = y / size;
      let R = Math.round(91 + t * (142 - 91));
      let G = Math.round(141 + t * (77 - 141));
      let B = Math.round(239 + t * (222 - 239));
      if (inPolygon(x, y, star)) { R = G = 255; B = 240; }
      rgba[idx] = R; rgba[idx + 1] = G; rgba[idx + 2] = B; rgba[idx + 3] = 255;
    }
  }
  return pngFromRGBA(size, size, rgba);
}

mkdirSync('icons', { recursive: true });
for (const size of [192, 512]) {
  writeFileSync(`icons/icon-${size}.png`, makeIcon(size));
  console.log(`icons/icon-${size}.png written`);
}
