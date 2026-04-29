import { readFileSync } from 'node:fs';
import { renderPost } from './index.js';

interface CliOptions {
  filePath: string;
  sanitize: boolean;
}

/**
 * Run the blogkit CLI against a markdown file, writing the rendered HTML
 * (and front-matter as a JSON header line) to stdout.
 */
export function run(argv: string[]): number {
  const parsed = parseArgs(argv);
  if (!parsed) {
    printUsage();
    return 1;
  }

  let source: string;
  try {
    source = readFileSync(parsed.filePath, 'utf8');
  } catch (err) {
    process.stderr.write(`blogkit: cannot read ${parsed.filePath}\n`);
    return 1;
  }

  const rendered = renderPost(source, { sanitize: parsed.sanitize });
  process.stdout.write(`<!-- slug: ${rendered.slug} -->\n`);
  process.stdout.write(`<!-- title: ${rendered.frontMatter.title} -->\n`);
  process.stdout.write(rendered.html);
  process.stdout.write('\n');
  return 0;
}

function parseArgs(argv: string[]): CliOptions | null {
  let filePath: string | null = null;
  let sanitize = false;
  for (const arg of argv) {
    if (arg === '--sanitize') {
      sanitize = true;
    } else if (arg.startsWith('-')) {
      return null;
    } else {
      filePath = arg;
    }
  }
  if (!filePath) return null;
  return { filePath, sanitize };
}

function printUsage(): void {
  process.stderr.write('usage: blogkit <file.md> [--sanitize]\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(run(process.argv.slice(2)));
}
