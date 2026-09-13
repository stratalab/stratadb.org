// How a generated example is rendered on a page.
//
// No prompts. An example is there to be lifted, and a `$` or a `>>>` in front
// of it survives a hand selection even though the copy button strips it. The
// reference sites that expect you to run their examples print them bare, so we
// do too.
//
// The bundle ships CLI examples with a shell prompt, since its own markdown
// puts them in a ```console fence where the prompt is the convention. That is
// still right for the markdown twins, so the stripping happens here at render
// rather than in the staged data.
//
// Since 1.2.2 those examples are transcripts, not invocations: the prompt marks
// the command and the lines under it are what the binary printed back. That
// prompt is now the only thing separating a command from its result, so it is
// what decides how a line is rendered. Without it `created setting` reads as
// something you type.

/** A shell prompt at the head of a line, as the bundle writes it. */
const PROMPT = /^\s*\$ /;

/**
 * The CLI example as a transcript: prompt stripped, output kept in place.
 *
 * Rendering needs the output lines; copying must not include them. Both read
 * this, so the distinction is carried in the markup rather than by parsing
 * twice.
 */
export function cliExampleText(cli: string | undefined): string {
  if (!cli) return '';
  return cli
    .split('\n')
    .map((line) => line.replace(PROMPT, ''))
    .join('\n');
}

/** Which lines of a CLI example the binary printed back. */
export function cliOutputMask(cli: string | undefined): boolean[] {
  if (!cli) return [];
  const lines = cli.split('\n');
  if (!lines.some((line) => PROMPT.test(line))) return lines.map(() => false);
  return lines.map((line) => !PROMPT.test(line));
}

/** Python example, one statement per line, ready to paste. */
export function pythonExampleText(lines: string[] | undefined): string {
  return lines?.join('\n') ?? '';
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * An example as markup, one block element per command line.
 *
 * Long lines wrap rather than scroll away behind the edge of their frame: a
 * graph batch_write example is 2912px wide against a 1036px column, and three
 * screens of horizontal scroll hides most of it with nothing to say so. Each
 * line is its own element so a wrapped line can hang-indent, which is what
 * keeps a continuation from reading as a second command now that the examples
 * carry no prompt.
 *
 * Built as one string rather than as elements in a template: whitespace a
 * formatter adds around an expression inside a <pre> is preserved, and this
 * repo has shipped that bug three times.
 */
export function exampleHtml(text: string, outputMask: boolean[] = []): string {
  if (!text) return '';
  return text
    .split('\n')
    .map(
      (line, i) =>
        `<span class="cmd-line${outputMask[i] ? ' cmd-out' : ''}">${escapeHtml(line)}</span>`,
    )
    .join('');
}
