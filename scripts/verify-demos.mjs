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
      'An embedded database you can fork',
      'Why does AI application state need a different database?',
      'href="/docs"',
      '#primitive-kv',
      '#primitive-event',
      '#primitive-json',
      '#primitive-vector',
      '#primitive-graph',
      '#hub',
      'data-primitive-link',
      'data-install-mode',
      'data-hub-link',
      'data-section-jump',
      "jumpToSection('install')",
      'strata:primitive-request',
      'strata:install-mode-request',
    ],
  },
  {
    file: 'src/pages/index.astro',
    strings: ['<Hero />', '<Branching />', '<Inference />', '<Hub />', '<InstallClose />'],
  },
  {
    file: 'src/components/sections/Hub.astro',
    strings: [
      'id="hub"',
      'data-feature-eyebrow="strata-hub"',
      'Strata Hub',
      'Clone the dataset your experiment needs.',
      'Hub lists cloneable Strata databases',
      'Clone one, open it locally',
      'Browse Strata Hub',
      'strata clone movielens-100k ./ml',
      'agent-memory-with-experiments',
      'stackoverflow',
      'github-events',
    ],
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
      'data-feature-eyebrow="branching"',
      'Branching',
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
      'data-feature-eyebrow="primitives"',
      'Primitives',
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
      'native inference',
      'Stored context',
      'Inference layer',
      'Grounded result',
      'records stay local',
      'from ranked context',
      'KV',
      'JSON',
      'Event',
      'Vector',
      'The portfolio value moved from 98400 to 111080',
      'embed · rank · generate',
    ],
  },
  {
    file: 'src/components/sections/TimeTravel.astro',
    strings: [
      'data-feature-eyebrow="time-travel"',
      'Time travel',
      'Read any past version of your data.',
    ],
  },
  {
    file: 'src/components/sections/Inference.astro',
    strings: ['data-feature-eyebrow="inference"', 'Inference', 'AI is built-in'],
  },
  {
    file: 'src/components/sections/install/InstallTabs.tsx',
    strings: [
      'SDKs',
      'CLI',
      'VS Code',
      'Agents',
      'pip install stratadb',
      'npm install @stratadb/core',
      'curl -fsSL https://stratadb.org/install.sh | sh',
      'StrataDB for VS Code',
    ],
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
    strings: ["out: 'OK'", "out: 'merged'", 'Safe experiments without database copies'],
  },
  {
    file: 'src/components/sections/Inference.astro',
    strings: [
      'generation, and search through one primitive',
      'Inference is built in.',
      'Model work beside your records',
      'Embed, rank, and generate over stored records',
    ],
  },
  {
    file: 'src/components/sections/TimeTravel.astro',
    strings: ['Versioned reads without restores', 'Every write is queryable with --as-of'],
  },
  {
    file: 'src/components/sections/Hub.astro',
    strings: ['Prepared datasets for experiments', 'Hub removes the preprocessing step.'],
  },
  {
    file: 'src/components/sections/inference/InferenceDemo.tsx',
    strings: [
      'AI',
      'AiCore',
      'motion.circle',
      'built-in AI loop',
      'database records',
      'same file',
      'built into Strata',
      'grounded answer',
      'Why did portfolio.value move?',
      'native inference pipeline',
      'NATIVE LAYER',
      'Local GGUF',
      'OpenAI',
      'Anthropic',
      'Google',
      'ProviderRail',
      'CAPABILITIES',
      'CONTEXT_ROWS',
      'inference embed',
      'inference rank',
      'inference generate',
      'inference capability',
      'inference tokenize',
      'inference cache-status',
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
    strings: [
      'foundry',
      'Desktop app',
      'strata-foundry',
      'cargo install strata-cli',
      'strata clone iris ./iris',
      "id: 'hub'",
      'HubPanel',
      'For agents',
    ],
  },
  {
    file: 'src/components/sections/primitives/PrimitiveTabs.tsx',
    strings: [
      'Multimodal data without extra services',
      'One database for KV, JSON, events, vectors, and graph',
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
