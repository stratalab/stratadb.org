import { access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, extname, join, relative, sep } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const SITE = 'https://stratadb.org';
const TEXT_EXTENSIONS = new Set(['.html', '.md', '.txt']);
const FORBIDDEN_SITEMAP_PATHS = ['/404/', '/internals/', '/specimen/'];
// Docs rebuild: the per-page markdown mirrors come back when the docs routes
// that emit them are restored. Re-add 'docs/index.md' and the section mirrors
// as each lands.
const REQUIRED_MACHINE_FILES = ['llms.txt', 'llms-full.txt'];

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(path)));
    } else {
      out.push(path);
    }
  }
  return out;
}

function toPosix(path) {
  return path.split(sep).join('/');
}

function routeForFile(file) {
  const rel = toPosix(relative(DIST, file));
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${dirname(rel)}/`;
  return `/${rel}`;
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x22;', '"')
    .replaceAll('&#39;', "'");
}

function stripHtmlCode(text) {
  return text
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, '')
    .replace(/<code\b[\s\S]*?<\/code>/gi, '');
}

function stripMarkdownCode(text) {
  return text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]+`/g, '');
}

function extractLinks(text, ext) {
  const links = [];

  if (ext === '.html') {
    text = stripHtmlCode(text);
    const attr = /\b(?:href|src|poster|action)=["']([^"']+)["']/gi;
    for (const match of text.matchAll(attr)) links.push(decodeHtml(match[1]));
  }

  if (ext === '.md' || ext === '.txt') {
    text = stripMarkdownCode(text);
    const markdown = /!?\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
    for (const match of text.matchAll(markdown)) links.push(match[1]);

    const absoluteSite = /https:\/\/stratadb\.org\/[^\s<>)"']*/g;
    for (const match of text.matchAll(absoluteSite)) links.push(match[0]);
  }

  return links;
}

function internalPath(raw, sourceRoute) {
  const value = raw.trim();
  if (!value || value.startsWith('#')) return null;
  if (/^(data|mailto|tel|javascript|blob):/i.test(value)) return null;
  if (value.startsWith('//')) return null;

  let url;
  try {
    url = new URL(value, `${SITE}${sourceRoute}`);
  } catch {
    return null;
  }

  if (url.origin !== SITE) return null;
  return decodeURIComponent(url.pathname);
}

async function resolves(pathname) {
  if (pathname === '/') return exists(join(DIST, 'index.html'));

  const clean = pathname.replace(/^\/+/, '');
  const direct = join(DIST, clean);
  const extension = extname(clean);

  if (extension) return exists(direct);
  if (pathname.endsWith('/')) return exists(join(direct, 'index.html'));

  return (await exists(join(direct, 'index.html'))) || (await exists(`${direct}.html`));
}

async function verifyInternalLinks(files) {
  const broken = [];
  for (const file of files) {
    const ext = extname(file);
    if (!TEXT_EXTENSIONS.has(ext)) continue;
    if (toPosix(relative(DIST, file)) === '404.html') continue;

    const text = await readFile(file, 'utf8');
    const sourceRoute = routeForFile(file);
    const seen = new Set();

    for (const raw of extractLinks(text, ext)) {
      const pathname = internalPath(raw, sourceRoute);
      if (!pathname || seen.has(pathname)) continue;
      seen.add(pathname);

      if (!(await resolves(pathname))) {
        broken.push({
          source: toPosix(relative(ROOT, file)),
          href: raw,
          resolved: pathname,
        });
      }
    }
  }
  return broken;
}

async function verifySitemap(files) {
  const failures = [];
  for (const file of files) {
    const rel = toPosix(relative(DIST, file));
    if (!rel.startsWith('sitemap') || extname(file) !== '.xml') continue;
    const text = await readFile(file, 'utf8');
    for (const path of FORBIDDEN_SITEMAP_PATHS) {
      if (text.includes(`${SITE}${path}`)) {
        failures.push({
          source: toPosix(relative(ROOT, file)),
          href: `${SITE}${path}`,
          resolved: path,
        });
      }
    }
  }
  return failures;
}

const files = await walk(DIST);
const relFiles = new Set(files.map((file) => toPosix(relative(DIST, file))));
const broken = await verifyInternalLinks(files);
const sitemapFailures = await verifySitemap(files);
const machineFailures = REQUIRED_MACHINE_FILES.filter((file) => !relFiles.has(file)).map(
  (file) => ({ source: 'dist', href: file, resolved: `/${file}` }),
);
const failures = [...broken, ...sitemapFailures, ...machineFailures];

if (failures.length > 0) {
  console.error(`verify-links: ${failures.length} failure(s)`);
  for (const failure of failures.slice(0, 100)) {
    console.error(`- ${failure.source}: ${failure.href} -> ${failure.resolved}`);
  }
  if (failures.length > 100) {
    console.error(`... ${failures.length - 100} more`);
  }
  process.exit(1);
}

const machineFileCount = files.filter((file) => ['.md', '.txt'].includes(extname(file))).length;
console.log(
  `verify-links: checked ${files.length} dist files including ${machineFileCount} machine docs; no broken internal links`,
);
