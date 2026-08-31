import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const PORT = Number(process.env.VISUAL_SMOKE_PORT ?? 4328);
const EXTERNAL_BASE_URL = process.env.VISUAL_BASE_URL;
const BASE_URL = EXTERNAL_BASE_URL ?? `http://127.0.0.1:${PORT}`;

const routes = [
  { path: '/', h1: /embedded database/i },
  { path: '/docs/', h1: /database you can fork/i },
  { path: '/docs/reference/', h1: /reference/i },
  { path: '/playground/', h1: /playground/i },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'compact-desktop', width: 1180, height: 820 },
  { name: 'mobile', width: 390, height: 844 },
];

async function waitForServer(proc) {
  const deadline = Date.now() + 30_000;
  let lastError = '';
  while (Date.now() < deadline) {
    if (proc.exitCode !== null && proc.exitCode !== 0) {
      throw new Error(`preview exited early with code ${proc.exitCode}`);
    }
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) return;
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err.message;
    }
    await delay(250);
  }
  throw new Error(`preview did not become ready at ${BASE_URL}: ${lastError}`);
}

async function assertHomepagePrimitiveLinks(page, viewport) {
  await page.locator('[data-primitive-link="json"]').click();
  await page.waitForFunction(() => window.location.hash === '#primitive-json', undefined, {
    timeout: 5_000,
  });
  await page.locator('#prim-tab-json[aria-selected="true"]').waitFor({
    state: 'visible',
    timeout: 10_000,
  });

  await page
    .waitForFunction(
      () => {
        const panelText = document.querySelector('#prim-panel')?.textContent ?? '';
        return /portfolio/i.test(panelText) && /aggressive/i.test(panelText);
      },
      undefined,
      { timeout: 5_000 },
    )
    .catch(() => {
      throw new Error(
        `${viewport.name} /: JSON hero tile did not activate the JSON primitive panel`,
      );
    });

  await assertSectionRuleDocked(page, viewport, 'primitives');
  await assertSectionTitleVisible(
    page,
    viewport,
    'Store every kind of app data in one embedded database.',
    'primitives',
  );
}

async function assertHomepageInferenceWorkbench(page, viewport) {
  await scrollSectionToNav(page, 'inference');
  await page.locator('text=native inference pipeline').first().waitFor({
    state: 'visible',
    timeout: 5_000,
  });
  await page.locator('text=The portfolio value moved from 98400 to 111080').first().waitFor({
    state: 'visible',
    timeout: 8_000,
  });

  const text = await page.locator('#inference').innerText();
  const frameMetrics = await page.locator('[data-inference-workbench]').evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      viewportHeight: window.innerHeight,
    };
  });
  const required = [
    'database context',
    'NATIVE LAYER',
    'grounded answer',
    'The portfolio value moved from 98400 to 111080',
    'Local GGUF',
    'OpenAI',
  ];

  for (const value of required) {
    if (!text.includes(value)) {
      throw new Error(`${viewport.name} /: inference workbench is missing "${value}"`);
    }
  }
  if (viewport.width >= 1024 && frameMetrics.bottom - frameMetrics.top > viewport.height * 1.05) {
    throw new Error(
      `${viewport.name} /: inference workbench is taller than the viewport (${(
        frameMetrics.bottom - frameMetrics.top
      ).toFixed(1)}px)`,
    );
  }
}

async function assertHomepageHubInstallMode(page, viewport) {
  await page.locator('[data-install-mode="hub"]').click();
  await page.waitForFunction(() => window.location.hash === '#install', undefined, {
    timeout: 5_000,
  });

  await page.locator('#mode-hub[aria-selected="true"]').waitFor({
    state: 'visible',
    timeout: 10_000,
  });

  const panelText = await page.locator('#install-panel').innerText();
  const required = [
    'Strata Hub',
    'prepared databases',
    'agent-memory-with-experiments',
    'movielens-100k',
    'strata clone iris ./iris',
    'clone records Hub origin',
  ];

  for (const value of required) {
    if (!panelText.includes(value)) {
      throw new Error(`${viewport.name} /: Hub install mode is missing "${value}"`);
    }
  }
}

async function assertHomepageTimeTravelAnimation(page, viewport) {
  const slider = page.locator('#time-travel [role="slider"]');
  await slider.waitFor({ state: 'visible', timeout: 5_000 });
  const initial = Number(await slider.getAttribute('aria-valuenow'));

  await page.waitForFunction(
    () =>
      Number(
        document.querySelector('#time-travel [role="slider"]')?.getAttribute('aria-valuenow'),
      ) <= 60,
    undefined,
    { timeout: 3_500 },
  );
  const mid = Number(await slider.getAttribute('aria-valuenow'));

  await page.waitForFunction(
    () =>
      Number(
        document.querySelector('#time-travel [role="slider"]')?.getAttribute('aria-valuenow'),
      ) >= 95,
    undefined,
    { timeout: 3_500 },
  );
  const returned = Number(await slider.getAttribute('aria-valuenow'));

  if (initial < 95 || mid > 60 || returned < 95) {
    throw new Error(
      `${viewport.name} /: time-travel playhead did not animate now -> past -> now (${initial}, ${mid}, ${returned})`,
    );
  }
}

async function assertSectionRuleDocked(page, viewport, ruleId) {
  const metrics = await page.locator(`[data-section-rule="${ruleId}"]`).evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const header = document.querySelector('header')?.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      headerBottom: header?.bottom ?? 0,
      text: el.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    };
  });

  if (Math.abs(metrics.top - metrics.headerBottom) > 3 || metrics.bottom <= metrics.headerBottom) {
    throw new Error(
      `${viewport.name} /: section rule "${metrics.text}" is not docked under nav (${metrics.top.toFixed(
        1,
      )} vs ${metrics.headerBottom.toFixed(1)})`,
    );
  }
}

async function assertSectionTitleVisible(page, viewport, title, ruleId) {
  const metrics = await page.evaluate(
    ({ title, ruleId }) => {
      const headings = [...document.querySelectorAll('h2')].filter(
        (el) => el.textContent?.trim() === title,
      );
      const heading =
        headings.find((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }) ?? headings[0];
      const rule = document.querySelector(`[data-section-rule="${ruleId}"]`);
      const headingRect = heading?.getBoundingClientRect();
      const ruleRect = rule?.getBoundingClientRect();
      return {
        found: Boolean(heading && rule),
        title,
        headingTop: headingRect?.top ?? 0,
        headingBottom: headingRect?.bottom ?? 0,
        ruleBottom: ruleRect?.bottom ?? 0,
        viewportHeight: window.innerHeight,
      };
    },
    { title, ruleId },
  );

  if (!metrics.found) {
    throw new Error(`${viewport.name} /: missing section title "${title}" or rule "${ruleId}"`);
  }
  if (
    metrics.headingTop < metrics.ruleBottom - 4 ||
    metrics.headingTop >= metrics.viewportHeight ||
    metrics.headingBottom <= metrics.ruleBottom
  ) {
    throw new Error(
      `${viewport.name} /: section title "${title}" is not visible below its docked rule (${metrics.headingTop.toFixed(
        1,
      )}-${metrics.headingBottom.toFixed(1)}, rule bottom ${metrics.ruleBottom.toFixed(1)})`,
    );
  }
}

async function assertSectionTitleNotBunched(page, viewport, title, ruleId) {
  const metrics = await page.evaluate(
    ({ title, ruleId }) => {
      const heading = [...document.querySelectorAll('h2')].find((el) => {
        if (el.textContent?.trim() !== title) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      const rule = document.querySelector(`[data-section-rule="${ruleId}"]`);
      const headingRect = heading?.getBoundingClientRect();
      const ruleRect = rule?.getBoundingClientRect();
      return {
        found: Boolean(heading && rule),
        title,
        headingTop: headingRect?.top ?? 0,
        ruleBottom: ruleRect?.bottom ?? 0,
      };
    },
    { title, ruleId },
  );

  if (!metrics.found) {
    throw new Error(`${viewport.name} /: missing section title "${title}" or rule "${ruleId}"`);
  }
  if (metrics.headingTop < metrics.ruleBottom + 48) {
    throw new Error(
      `${viewport.name} /: section title "${title}" is bunched against its rule (${metrics.headingTop.toFixed(
        1,
      )}, rule bottom ${metrics.ruleBottom.toFixed(1)})`,
    );
  }
}

async function assertSectionRuleReleased(page, viewport, ruleId) {
  const metrics = await page.locator(`[data-section-rule="${ruleId}"]`).evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const header = document.querySelector('header')?.getBoundingClientRect();
    return {
      top: rect.top,
      headerBottom: header?.bottom ?? 0,
      text: el.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    };
  });

  if (metrics.top >= metrics.headerBottom - 4) {
    throw new Error(
      `${viewport.name} /: static section rule "${metrics.text}" is still held under nav (${metrics.top.toFixed(
        1,
      )} vs ${metrics.headerBottom.toFixed(1)})`,
    );
  }
}

async function scrollSectionToNav(page, sectionId) {
  await page.evaluate((id) => {
    document.documentElement.style.scrollBehavior = 'auto';
    const el = document.getElementById(id);
    const header = document.querySelector('header');
    if (!el) throw new Error(`missing section #${id}`);
    const offset = header?.getBoundingClientRect().height ?? 0;
    window.scrollTo({
      top: Math.round(window.scrollY + el.getBoundingClientRect().top - offset),
      behavior: 'instant',
    });
  }, sectionId);
  await page.waitForTimeout(80);
}

async function assertHomepageSectionBreaks(page, viewport) {
  const sections = [
    ['branch', 'branches', 'Branch the whole database.', 'pinned'],
    [
      'primitives',
      'primitives',
      'Store every kind of app data in one embedded database.',
      'pinned',
    ],
    ['time-travel', 'time-travel', 'Read any past version of your data.', 'pinned'],
    ['inference', 'native-inference', 'Inference is built in.', 'pinned'],
  ];

  for (const [sectionId, ruleId, title, mode] of sections) {
    await scrollSectionToNav(page, sectionId);
    await assertSectionRuleDocked(page, viewport, ruleId);
    await assertSectionTitleVisible(page, viewport, title, ruleId);
    if (viewport.width >= 1024 && sectionId !== 'branch') {
      await assertSectionTitleNotBunched(page, viewport, title, ruleId);
    }
    if (sectionId === 'time-travel') {
      await assertHomepageTimeTravelAnimation(page, viewport);
    }
    await page.evaluate(() => window.scrollBy(0, Math.min(220, window.innerHeight * 0.22)));
    await page.waitForTimeout(120);
    if (mode === 'pinned') {
      await assertSectionRuleDocked(page, viewport, ruleId);
      if (viewport.width >= 1024) await assertSectionTitleVisible(page, viewport, title, ruleId);
    } else {
      await assertSectionRuleReleased(page, viewport, ruleId);
    }
  }
}

function startPreview() {
  if (!existsSync(join(ROOT, 'dist', 'index.html'))) {
    throw new Error('dist/index.html is missing; run npm run build before visual smoke');
  }

  const proc = spawn(
    'npm',
    ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT)],
    {
      cwd: ROOT,
      env: { ...process.env, NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  let output = '';
  proc.stdout.on('data', (chunk) => {
    output += chunk;
  });
  proc.stderr.on('data', (chunk) => {
    output += chunk;
  });
  proc.output = () => output.trim();
  return proc;
}

async function assertPage(browser, route, viewport) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  try {
    const url = new URL(route.path, BASE_URL).toString();
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
    if (!response || !response.ok()) {
      throw new Error(
        `${viewport.name} ${route.path}: expected 2xx, received ${response?.status() ?? 'no response'}`,
      );
    }

    await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
    await page.waitForTimeout(250);

    let h1 = '';
    try {
      h1 = (await page.locator('h1').first().textContent({ timeout: 5_000 }))?.trim() ?? '';
    } catch (err) {
      throw new Error(`${viewport.name} ${route.path}: h1 not found: ${err.message}`);
    }
    if (!route.h1.test(h1)) {
      throw new Error(`${viewport.name} ${route.path}: unexpected h1 "${h1}"`);
    }

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const bodyText = document.body.innerText.trim();
      const overflowX = doc.scrollWidth - doc.clientWidth;
      const samples = [
        [0.5, 0.25],
        [0.5, 0.5],
        [0.5, 0.75],
      ].map(([x, y]) => {
        const el = document.elementFromPoint(window.innerWidth * x, window.innerHeight * y);
        return el && el !== document.body && el !== document.documentElement;
      });

      return {
        bodyChars: bodyText.length,
        overflowX,
        sampledVisibleElementCount: samples.filter(Boolean).length,
      };
    });

    if (metrics.bodyChars < 80) {
      throw new Error(`${viewport.name} ${route.path}: page rendered too little visible text`);
    }
    if (metrics.overflowX > 2) {
      throw new Error(`${viewport.name} ${route.path}: horizontal overflow ${metrics.overflowX}px`);
    }
    if (metrics.sampledVisibleElementCount === 0) {
      throw new Error(`${viewport.name} ${route.path}: viewport center samples are blank`);
    }
    if (route.path === '/') {
      await assertHomepageSectionBreaks(page, viewport);
      await assertHomepageInferenceWorkbench(page, viewport);
      await assertHomepagePrimitiveLinks(page, viewport);
      await assertHomepageHubInstallMode(page, viewport);
    }
    if (consoleErrors.length > 0 || pageErrors.length > 0) {
      throw new Error(
        `${viewport.name} ${route.path}: browser error(s)\n${[...consoleErrors, ...pageErrors].join('\n')}`,
      );
    }
  } finally {
    await page.close();
  }
}

let preview;
let browser;

try {
  if (!EXTERNAL_BASE_URL) {
    preview = startPreview();
    await waitForServer(preview);
  }

  browser = await chromium.launch({ headless: true });
  for (const viewport of viewports) {
    for (const route of routes) {
      await assertPage(browser, route, viewport);
    }
  }

  console.log(
    `visual-smoke: ${routes.length} route(s) checked across ${viewports.length} viewport(s)`,
  );
} catch (err) {
  console.error(`visual-smoke: failed: ${err.message}`);
  if (preview?.output?.()) console.error(preview.output());
  process.exitCode = 1;
} finally {
  await browser?.close();
  if (preview && !EXTERNAL_BASE_URL) {
    spawnSync('npm', ['run', 'preview', '--', 'stop'], {
      cwd: ROOT,
      env: { ...process.env, NO_COLOR: '1' },
      stdio: 'ignore',
    });
  }
  if (preview && preview.exitCode === null) {
    preview.kill('SIGTERM');
    await delay(250);
    if (preview.exitCode === null) preview.kill('SIGKILL');
  }
}
