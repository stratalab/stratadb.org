import { readFile } from 'node:fs/promises';

async function readSource(file) {
  try {
    return await readFile(file, 'utf8');
  } catch (error) {
    failures.push(`${file}: cannot read (${error.code || error.message})`);
    return '';
  }
}

const REQUIRED = [
  {
    file: 'src/components/sections/Hero.astro',
    strings: [
      'id="hero"',
      'Strata is the embedded database for the AI era',
      '#primitive-kv',
      '#primitive-event',
      '#primitive-json',
      '#primitive-vector',
      '#primitive-graph',
      'data-primitive-link',
      'strata:primitive-request',
    ],
  },
  {
    file: 'src/pages/index.astro',
    strings: ['<Hero />', '<Branching />', '<Resources />', '<InstallClose />'],
  },
  {
    file: 'src/lib/engine/heroScript.ts',
    strings: [
      'kv put portfolio.value 98400',
      'created portfolio.value applied=true',
      'branch fork default risky',
      '"name": "risky"',
      'kv put portfolio.value 111080',
      'updated portfolio.value applied=true',
      'branch diff default risky',
      '"branch_b": "risky"',
      'branch preview risky default',
      '"conflicts": []',
      'branch merge risky default',
      '"target": "default"',
      '111080',
    ],
  },
  {
    file: 'src/components/sections/branch/BranchScrub.tsx',
    strings: [
      'Branch the whole database.',
      'branch fork default risky',
      '"name": "risky"',
      'branch diff default risky',
      '"capability": "json"',
      'branch preview risky default',
      '"conflicts": []',
      'branch merge risky default',
      '"target": "default"',
    ],
  },
  {
    file: 'src/components/sections/timetravel/TimeScrubber.tsx',
    strings: ['const asOf = cur?.version ?? 0;', '{asOf}'],
  },
  {
    file: 'src/components/sections/primitives/PrimitiveTabs.tsx',
    strings: [
      'portfolio.strata',
      'StrataDB for VS Code',
      'Strata extension active',
      'Strata data views',
      'primitiveFromHash',
      'strata:primitive-request',
      'portfolio.currency',
      'allocation.policy',
      'risk.snapshot',
      'allocation fields updated',
    ],
  },
  {
    file: 'src/data/seed.ts',
    strings: [
      'portfolio.value',
      'portfolio.currency',
      'portfolio.risk',
      'allocation.policy',
      'merge.preview',
    ],
  },
  {
    file: 'src/components/sections/inference/InferenceDemo.tsx',
    strings: [
      'native inference pipeline',
      'database context',
      'inference embed miniLM "why did portfolio.value move?"',
      'inference rank jina-reranker-v1-tiny "why did portfolio.value move?" "...passages"',
      'inference generate openai:gpt-4o-mini "Answer from ranked portfolio context." --max-tokens 80',
      'inference capability openai:gpt-4o-mini',
      'inference tokenize tinyllama "portfolio.value moved"',
      'inference cache-status',
      'The portfolio value moved from 98400 to 111080',
      'Local GGUF',
      'OpenAI',
    ],
  },
  {
    file: 'src/components/sections/install/InstallTabs.tsx',
    strings: ['Library', 'CLI', 'For agents'],
  },
];

const FORBIDDEN = [
  {
    file: 'src/pages/index.astro',
    strings: ['<LandingSpine />', 'cherry-pick', 'time travel, and search', 'temporarily hidden'],
  },
  {
    file: 'src/lib/engine/heroScript.ts',
    strings: [
      "text: 'branch diff experiment'",
      "text: 'branch merge experiment'",
      'branch fork default experiment',
      'config.theme',
      '(version) 1',
      "text: 'OK'",
      "text: 'merged'",
    ],
  },
  {
    file: 'src/components/sections/branch/BranchScrub.tsx',
    strings: ["out: 'OK'", "out: 'merged'"],
  },
  {
    file: 'src/components/sections/Inference.astro',
    strings: ['generation, and search through one primitive'],
  },
  {
    file: 'src/components/sections/inference/InferenceDemo.tsx',
    strings: [
      'infer embed',
      'infer generate',
      'infer use',
      'anthropic/claude',
      'same call, new model',
      'embed, generate, search',
      'deploy failed',
    ],
  },
  {
    file: 'src/components/sections/install/InstallTabs.tsx',
    strings: ['foundry', 'Desktop app', 'strata-foundry'],
  },
  {
    file: 'src/components/sections/primitives/PrimitiveTabs.tsx',
    strings: [
      'Strata Foundry',
      'strata-foundry/src',
      'config.theme',
      'greeting',
      'profile',
      'Alice',
      'admin',
      'midnight',
      'window.scrollTo',
    ],
  },
  {
    file: 'src/data/seed.ts',
    strings: ['config.theme', 'greeting', 'profile', 'Alice', 'midnight'],
  },
  {
    file: 'src/components/chrome/Footer.astro',
    strings: ['strata-foundry'],
  },
];

const failures = [];

for (const check of REQUIRED) {
  const text = await readSource(check.file);
  for (const value of check.strings) {
    if (!text.includes(value)) failures.push(`${check.file}: missing '${value}'`);
  }
}

for (const check of FORBIDDEN) {
  const text = await readSource(check.file);
  for (const value of check.strings) {
    if (text.includes(value)) failures.push(`${check.file}: forbidden '${value}'`);
  }
}

if (failures.length > 0) {
  console.error(`verify-demos: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('verify-demos: homepage demo source is aligned with current claims');
