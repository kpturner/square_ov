import { readFile } from 'fs/promises';
import { join } from 'path';
import { defineEventHandler, readBody } from 'h3';
import OpenAI from 'openai';
import { promises as fs } from 'fs';

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

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ question: string }>(event);
    const question = body.question?.trim();
    if (!question) return { answer: 'No question provided.', success: false };

    await loadDocs();

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
