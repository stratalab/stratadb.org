// OG image (04 §9): dark canvas, layer glyph, H1, stat strip — rendered with
// the real fonts via headless chromium (no satori dependency chain).
// Run manually or in CI after font changes; output is committed.
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const font = (await readFile(new URL('../public/fonts/GeneralSans-Variable.woff2', import.meta.url))).toString('base64');
const mono = (await readFile(new URL('../public/fonts/CommitMono-400.woff2', import.meta.url))).toString('base64');
const release = JSON.parse(await readFile(new URL('../src/data/release.json', import.meta.url), 'utf8'));

const html = `<!doctype html><html><head><style>
@font-face{font-family:GS;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:200 700}
@font-face{font-family:CM;src:url(data:font/woff2;base64,${mono}) format('woff2')}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#000000;font-family:GS;display:flex;flex-direction:column;justify-content:center;padding:80px;position:relative;overflow:hidden}
.horizon{position:absolute;left:0;right:0;bottom:0;height:300px;background:radial-gradient(60% 100% at 50% 100%,rgba(255,122,82,.22),transparent 70%)}
.moon{position:absolute;left:0;right:0;top:0;height:340px;background:radial-gradient(120% 100% at 50% 0%,rgba(106,136,215,.30),transparent 65%)}
.line{position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,transparent,#ff7a52 35%,#ffb191 50%,#ff7a52 65%,transparent)}
.brand{display:flex;align-items:center;gap:14px;margin-bottom:48px}
.brand span{color:#f5f0eb;font-size:28px;font-weight:600}
h1{color:#f5f0eb;font-size:96px;font-weight:600;letter-spacing:-.035em;line-height:.98}
.badge{margin-top:28px;color:#9a9ca3;font-family:CM;font-size:22px}
.stats{position:absolute;bottom:64px;left:80px;color:#7e8189;font-family:CM;font-size:20px}
</style></head><body>
<div class="horizon"></div><div class="line"></div>
<div class="brand">
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff7a52" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 12l10 5 10-5"/><path d="M2 17l10 5 10-5"/></svg>
<span>StrataDB</span></div>
<h1>An embedded database.</h1>
<div class="badge">Research preview · v${release.version}</div>
<div class="stats">250K ops/s · &lt;1 ms fork · 5 primitives · 0 servers · Apache-2.0</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.screenshot({ path: new URL('../public/og/default.png', import.meta.url).pathname });
await browser.close();
console.log('public/og/default.png written');
