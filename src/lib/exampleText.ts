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

/** A shell prompt at the head of a line, as the bundle writes it. */
const PROMPT = /^\s*\$ /;

/** CLI example, one command per line, ready to paste. */
export function cliExampleText(cli: string | undefined): string {
  if (!cli) return '';
  return cli
    .split('\n')
    .map((line) => line.replace(PROMPT, ''))
    .join('\n');
}

/** Python example, one statement per line, ready to paste. */
export function pythonExampleText(lines: string[] | undefined): string {
  return lines?.join('\n') ?? '';
}
