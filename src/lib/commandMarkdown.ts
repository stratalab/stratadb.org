// A generated command as CommonMark.
//
// The site is static, so it cannot negotiate on Accept and hand an agent
// markdown instead of HTML. The workable equivalent is a twin document at a
// predictable URL: every reference page is also served at the same path with
// `.md` appended, advertised from the HTML head so a crawler can find it.
//
// Same data as the rendered page. Deliberately flat and unstyled: an agent
// pasting this into a context window should get facts, not chrome.
import index from '../data/command-index.json';
import schemas from '../data/command-schemas.json';
import examples from '../data/command-examples.json';
import registry from '../data/error-registry.json';
import bindings from '../data/python-bindings.json';

interface SchemaProp {
  type?: string | string[];
  $ref?: string;
  description?: string;
}
interface CommandSchema {
  $defs?: Record<string, { description?: string; oneOf?: { const?: string }[] }>;
  request?: { required?: string[]; properties?: Record<string, SchemaProp> };
  response?: { properties?: Record<string, SchemaProp> };
}

const typeName = (spec: SchemaProp): string => {
  if (typeof spec.$ref === 'string') return spec.$ref.split('/').pop() ?? 'any';
  if (Array.isArray(spec.type)) return spec.type.join(' or ');
  return spec.type ?? 'any';
};

const COMMIT_LABEL: Record<string, string> = {
  none: 'no commit',
  commits_on_success: 'commits on success',
  itemwise_shared_commit: 'itemwise, one shared commit',
  chunked_commits: 'chunked commits',
};

export function commandIds(): string[] {
  return index.commands.map((c) => c.id);
}

export interface MarkdownOptions {
  site?: string;
  /** Command ids whose pages exist. Siblings outside this set are named, not linked. */
  published?: Iterable<string>;
}

export function commandMarkdown(id: string, options: MarkdownOptions = {}): string {
  const site = options.site ?? 'https://stratadb.org';
  const published = new Set(options.published ?? []);
  const command = index.commands.find((c) => c.id === id);
  if (!command) throw new Error(`commandMarkdown: unknown command id "${id}"`);

  const schema = (schemas as Record<string, CommandSchema>)[id];
  const example = (examples as Record<string, { intro?: string; cli?: string; wire?: string }>)[id];
  const python = (
    bindings as Record<string, { call: string; signature: string; example: string[] }>
  )[id];
  const codes = new Map(registry.errors.map((e) => [e.code, e]));

  const required = new Set<string>(schema?.request?.required ?? []);
  const out: string[] = [];

  out.push(`# ${command.title}`);
  out.push('');
  out.push(`Source: ${site}${command.docs}`);
  out.push('');
  out.push(command.summary);
  out.push('');

  // The facts an agent most needs and is least able to infer.
  out.push('| | |');
  out.push('|---|---|');
  out.push(`| Command | \`${command.id}\` |`);
  out.push(`| CLI | \`strata ${command.cli?.path?.join(' ') ?? ''}\` |`);
  if (command.wire) out.push(`| Wire type | \`${command.wire}\` |`);
  // No MCP tool row: the catalog names one per command, the server serves 20,
  // so 120 of those names address nothing (strata-core issue 2892).
  if (python) out.push(`| Python | \`${python.call}${python.signature}\` |`);
  out.push(`| Access | ${command.access} |`);
  out.push(`| Commit | ${COMMIT_LABEL[command.commit] ?? command.commit} |`);
  out.push(`| Wire status | ${command.wire_status} |`);
  out.push('');
  out.push(command.description);
  out.push('');

  if (example?.cli || example?.wire || python?.example?.length) {
    out.push('## Examples');
    out.push('');
    if (example?.intro) {
      out.push(example.intro);
      out.push('');
    }
    if (example?.cli) {
      out.push('### CLI');
      out.push('');
      out.push('```console');
      out.push(example.cli);
      out.push('```');
      out.push('');
    }
    if (example?.wire) {
      out.push('### Wire');
      out.push('');
      out.push('```json');
      out.push(example.wire);
      out.push('```');
      out.push('');
    }
    if (python?.example?.length) {
      out.push('### Python');
      out.push('');
      out.push('```python');
      out.push(python.example.join('\n'));
      out.push('```');
      out.push('');
    }
  }

  const params = Object.entries(schema?.request?.properties ?? {}).filter(
    ([name]) => name !== 'type',
  );
  if (params.length) {
    out.push('## Parameters');
    out.push('');
    out.push('| Name | Type | Required | Description |');
    out.push('|---|---|---|---|');
    for (const [name, spec] of params) {
      const ref = typeof spec.$ref === 'string' ? spec.$ref.split('/').pop() : null;
      const def = ref ? schema?.$defs?.[ref] : undefined;
      const options = def?.oneOf?.map((o) => o.const).filter(Boolean) ?? [];
      const description = [spec.description ?? def?.description ?? '']
        .concat(options.length ? [`One of: ${options.join(', ')}.`] : [])
        .join(' ')
        .trim();
      out.push(
        `| \`${name}\` | \`${typeName(spec)}\` | ${required.has(name) ? 'yes' : 'no'} | ${description} |`,
      );
    }
    out.push('');
  }

  out.push('## Returns');
  out.push('');
  out.push(`\`${command.response_model}\``);
  out.push('');
  const returns = Object.entries(schema?.response?.properties ?? {});
  if (returns.length) {
    for (const [name, spec] of returns) {
      const description = spec.description ? ` ${spec.description}` : '';
      out.push(`- \`${name}\` (\`${typeName(spec)}\`)${description}`);
    }
    out.push('');
  }

  if (command.errors?.length) {
    out.push('## Errors');
    out.push('');
    out.push('Recover by code, never by message.');
    out.push('');
    out.push('| Code | Retry | Commit outcome |');
    out.push('|---|---|---|');
    for (const err of command.errors) {
      const detail = codes.get(err.code);
      out.push(
        `| [\`${err.code}\`](${site}/e/${err.code}) | ${detail?.retry_policy ?? 'unknown'} | ${detail?.commit_outcome ?? 'unknown'} |`,
      );
    }
    out.push('');
  }

  const siblings = index.commands.filter((c) => c.family === command.family && c.id !== command.id);
  if (siblings.length) {
    out.push('## Related');
    out.push('');
    // Link only what exists; name the rest. A dead link is worse than a plain
    // title, especially for an agent following references.
    out.push(
      siblings
        .map((s) =>
          published.has(s.id) ? `- [${s.title}](${site}${s.docs})` : `- ${s.title} (\`${s.id}\`)`,
        )
        .join('\n'),
    );
    out.push('');
  }

  return `${out.join('\n').trimEnd()}\n`;
}
