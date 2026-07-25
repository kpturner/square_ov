import { readFile } from 'fs/promises';
import { join } from 'path';
import { defineEventHandler, readBody } from 'h3';
import OpenAI from 'openai';
import { promises as fs } from 'fs';
import type { Rank } from '~/types';
import type { OVType } from '@prisma/client';

const { apiKey } = useRuntimeConfig().openAi;
const openai = new OpenAI({ apiKey });

// In-memory cache for docs (feature -> content)
const docsCache: Record<string, string> = {};

// Helper: recursively get all Markdown files
async function getAllMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Helper: remove YAML frontmatter from Markdown
function stripFrontmatter(content: string): string {
  return content.replace(/^---[\s\S]*?---\s*/, '');
}

// Load all docs into memory at first request
async function loadDocs() {
  if (Object.keys(docsCache).length > 0) return;

  const docsFolder = join(process.cwd(), 'docs', 'markdown');
  const files = await getAllMarkdownFiles(docsFolder);

  for (const file of files) {
    const raw = await readFile(file, 'utf-8');
    const content = stripFrontmatter(raw).trim();
    // Use filename without extension as feature key
    const feature = file
      .replace(docsFolder + '/', '')
      .replace(/\.md$/, '')
      .replace(/\//g, '-'); // e.g., events/creating-events -> events-creating-events
    docsCache[feature] = content;
  }
}

// Simple relevance filter: include docs whose feature name or content matches keywords
function filterDocsForQuestion(question: string): string[] {
  const q = question.toLowerCase();
  const result: string[] = [];
  for (const [feature, content] of Object.entries(docsCache)) {
    if (feature.includes(q) || content.toLowerCase().includes(q)) {
      result.push(content);
    }
  }
  return result;
}

function rankOrderDoc(ovType: OVType, ranks: Rank[]): string {
  if (!Array.isArray(ranks) || ranks.length === 0) return '';

  const lines: string[] = ranks.map((r, idx) => {
    if (r && (r.value !== undefined || r.title !== undefined)) {
      const value = r.value !== undefined ? String(r.value) : `#${idx + 1}`;
      const title = r.title !== undefined ? String(r.title) : '';
      return title ? `${value} - ${title}` : `${value}`;
    }
    // Fallback: stringify unknown shape
    try {
      return JSON.stringify(r);
    } catch {
      return String(r);
    }
  });

  return `The ${ovType === 'craft' ? 'Craft' : 'Royal Arch'} ranks in order of precedence are:\n${lines.join('\n')}`;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ question: string }>(event);
    const question = body.question?.trim();
    if (!question) return { answer: 'No question provided.', success: false };

    const cfg = useRuntimeConfig().public;

    await loadDocs();

    // Add configuration information to document cache
    const ranks = cfg.ranks;
    const raRanks = cfg.raRanks;

    docsCache['craft-rank-order'] = rankOrderDoc('craft', ranks as Rank[]);
    docsCache['royal-arch-rank-order'] = rankOrderDoc('ra', raRanks as Rank[]);

    // Select only relevant docs
    const relevantDocs = filterDocsForQuestion(question);
    const docsContent =
      relevantDocs.length > 0 ? relevantDocs.join('\n\n') : Object.values(docsCache).join('\n\n');

    const prompt = `
You are an assistant for Square OV, an online Masonic official visit planner.
Answer concisely in human-readable help format, referencing the documentation below if needed.

Documentation:
${docsContent}

Question: ${question}
Answer:
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const answer = response.choices?.[0]?.message?.content || "Sorry, I couldn't find an answer.";

    return { success: true, answer };
  } catch (err) {
    const e = err as { code?: string; status?: number; message?: string };
    logger.error(e, 'Help Chat API error:');

    if (e.code === 'insufficient_quota' || e.status === 429) {
      return {
        success: false,
        noCredits: true,
        answer: 'Chat is temporarily unavailable — no credits on the OpenAI account.',
      };
    }

    return {
      success: false,
      answer: 'Sorry, an error occurred while trying to answer your question.',
    };
  }
});
