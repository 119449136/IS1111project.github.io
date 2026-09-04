/** Render the SVG app icon to the PNG sizes a home-screen install needs. */
import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('..', import.meta.url);
const svg = await readFile(new URL('icons/icon.svg', root), 'utf8');
// The environment ships its own Chromium, so point Playwright at it rather
// than downloading a second copy.
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

// A maskable icon must keep its artwork inside the safe circle, so the badge
// is scaled down and the background bled to the edges.
const variants = [
  { file: 'icons/icon-192.png', size: 192, pad: 0 },
  { file: 'icons/icon-512.png', size: 512, pad: 0 },
  { file: 'icons/icon-180.png', size: 180, pad: 0 },
  { file: 'icons/icon-maskable-512.png', size: 512, pad: 0.18 },
];

for (const v of variants) {
  const page = await browser.newPage({ viewport: { width: v.size, height: v.size }, deviceScaleFactor: 1 });
  const inner = v.pad > 0
    ? `<div style="position:absolute;inset:0;background:#123c2f"></div>
       <div style="position:absolute;inset:${v.pad * 100}%">${svg}</div>`
    : svg;
  await page.setContent(
    `<body style="margin:0;width:${v.size}px;height:${v.size}px;position:relative;overflow:hidden">
       ${inner}
       <style>svg{width:100%;height:100%;display:block}</style>
     </body>`,
  );
  await writeFile(new URL(v.file, root), await page.screenshot({ omitBackground: false }));
  await page.close();
  console.log('wrote', v.file);
}
await browser.close();
