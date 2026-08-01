import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { marked } from 'marked';

// Strip raw HTML from markdown source -- belt-and-suspenders since we control content
marked.use({
  renderer: {
    html(token: { raw: string; block: boolean }): string {
      return (token.raw ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    },
  },
  gfm: true,
  breaks: false,
});

export interface ArticleMeta {
  title: string;
  description: string;
  slug: string;
  author: string;
  datePublished: string;
  tags: string[];
  primaryKeyword: string;
  state: string;
  waterBody: string;
}

export interface Article extends ArticleMeta {
  body: string;
}

const CONTENT_DIR = join(process.cwd(), 'src/content/editorial');

const ARCHIVED_SLUGS = new Set([
  'ada-accessible-boat-ramps-florida',
  'free-boat-ramps-florida',
  'saltwater-boat-ramps-florida-by-region',
]);

function isArchivedFile(file: string): boolean {
  return ARCHIVED_SLUGS.has(file.replace(/\.md$/, ''));
}

function parseFrontmatter(source: string): { meta: Record<string, unknown>; body: string } {
  const match = source.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: source };

  const meta: Record<string, unknown> = {};
  match[1].split('\n').forEach(line => {
    const colon = line.indexOf(':');
    if (colon === -1) return;
    const key = line.slice(0, colon).trim();
    const raw = line.slice(colon + 1).trim();
    if (raw.startsWith('[')) {
      meta[key] = raw
        .slice(1, -1)
        .split(',')
        .map(s => s.trim().replace(/^['"]|['"]$/g, ''));
    } else {
      meta[key] = raw.replace(/^['"]|['"]$/g, '');
    }
  });

  return { meta, body: match[2] };
}

function toMeta(meta: Record<string, unknown>, slug: string): ArticleMeta {
  return {
    title: String(meta.title ?? ''),
    description: String(meta.description ?? ''),
    slug: String(meta.slug ?? slug),
    author: String(meta.author ?? ''),
    datePublished: String(meta.datePublished ?? ''),
    tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [],
    primaryKeyword: String(meta.primaryKeyword ?? ''),
    state: String(meta.state ?? ''),
    waterBody: String(meta.waterBody ?? ''),
  };
}

export function getAllArticles(): ArticleMeta[] {
  let files: string[];
  try {
    files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md') && !isArchivedFile(f));
  } catch {
    return [];
  }
  return files
    .map(file => {
      const source = readFileSync(join(CONTENT_DIR, file), 'utf8');
      const { meta } = parseFrontmatter(source);
      return toMeta(meta, file.replace('.md', ''));
    })
    .sort((a, b) => b.datePublished.localeCompare(a.datePublished));
}

export function getAllSlugs(): string[] {
  try {
    return readdirSync(CONTENT_DIR)
      .filter(f => f.endsWith('.md'))
      .filter(f => !isArchivedFile(f))
      .map(f => f.replace('.md', ''));
  } catch {
    return [];
  }
}

export function getArticle(slug: string): Article | null {
  if (ARCHIVED_SLUGS.has(slug)) return null;
  const filePath = join(CONTENT_DIR, `${slug}.md`);
  let source: string;
  try {
    source = readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }

  const { meta, body: rawBody } = parseFrontmatter(source);
  const body = marked(rawBody) as string;

  return { ...toMeta(meta, slug), body };
}
