/**
 * History Tracker
 * Manages a markdown file containing the last 3 weeks of research findings
 * Used to prevent duplicate reporting in weekly digests
 *
 * In production (Vercel), uses KV storage since filesystem is read-only
 * Locally, also writes to data/history.md for easy viewing
 */

import { kv } from '@vercel/kv';
import * as fs from 'fs';
import * as path from 'path';
import { ResearchFinding, ProjectName } from '@/types';

const HISTORY_FILE = path.join(process.cwd(), 'data', 'history.md');
const KV_HISTORY_KEY = 'research_history_weeks';
const WEEKS_TO_KEEP = 3;

export interface HistoryEntry {
  date: string;
  project: ProjectName;
  category: string;
  summary: string;
  keyFindings: string[];
  sources: string[];
}

export interface WeeklyHistory {
  weekStart: string; // ISO date of Monday
  entries: HistoryEntry[];
}

/**
 * Check if Vercel KV is available
 */
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * Get the Monday of the current week
 */
function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

/**
 * Convert a finding to a history entry
 */
function findingToHistoryEntry(finding: ResearchFinding): HistoryEntry {
  return {
    date: finding.timestamp.split('T')[0],
    project: finding.project,
    category: finding.category,
    summary: finding.mostImportantInsight || finding.keyFindings[0] || '',
    keyFindings: finding.keyFindings.slice(0, 5),
    sources: finding.sources.map(s => s.url).slice(0, 3),
  };
}

/**
 * Load history from KV or file
 */
export async function loadHistory(): Promise<WeeklyHistory[]> {
  if (isKVAvailable()) {
    try {
      const history = await kv.get<WeeklyHistory[]>(KV_HISTORY_KEY);
      if (history) {
        console.log(`Loaded ${history.length} weeks of history from KV`);
        return history;
      }
    } catch (error) {
      console.error('Failed to load history from KV:', error);
    }
  }

  // Try loading from local file
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const content = fs.readFileSync(HISTORY_FILE, 'utf-8');
      const history = parseMarkdownHistory(content);
      console.log(`Loaded ${history.length} weeks of history from file`);
      return history;
    }
  } catch (error) {
    console.error('Failed to load history from file:', error);
  }

  return [];
}

/**
 * Save history to KV and/or file
 */
export async function saveHistory(history: WeeklyHistory[]): Promise<void> {
  // Prune old weeks
  const prunedHistory = pruneHistory(history);

  if (isKVAvailable()) {
    try {
      await kv.set(KV_HISTORY_KEY, prunedHistory);
      console.log(`Saved ${prunedHistory.length} weeks of history to KV`);
    } catch (error) {
      console.error('Failed to save history to KV:', error);
    }
  }

  // Also save to local file if writable
  try {
    const markdown = historyToMarkdown(prunedHistory);
    fs.writeFileSync(HISTORY_FILE, markdown, 'utf-8');
    console.log(`Saved history to ${HISTORY_FILE}`);
  } catch (error) {
    // File system might be read-only in production
    console.log('Could not write history file (expected in production)');
  }
}

/**
 * Keep only the last N weeks of history
 */
function pruneHistory(history: WeeklyHistory[]): WeeklyHistory[] {
  // Sort by weekStart descending
  const sorted = [...history].sort(
    (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
  );
  return sorted.slice(0, WEEKS_TO_KEEP);
}

/**
 * Add new findings to history
 */
export async function addToHistory(findings: ResearchFinding[]): Promise<void> {
  const history = await loadHistory();
  const weekStart = getWeekStart();

  // Find or create current week
  let currentWeek = history.find(w => w.weekStart === weekStart);
  if (!currentWeek) {
    currentWeek = { weekStart, entries: [] };
    history.push(currentWeek);
  }

  // Add new entries
  const newEntries = findings.map(findingToHistoryEntry);
  currentWeek.entries.push(...newEntries);

  await saveHistory(history);
}

/**
 * Check if a finding is a duplicate of something in history
 */
export function isDuplicate(
  finding: ResearchFinding,
  history: WeeklyHistory[]
): { isDuplicate: boolean; matchedEntry?: HistoryEntry; matchedWeek?: string } {
  const newSummary = (finding.mostImportantInsight || finding.keyFindings[0] || '').toLowerCase();
  const newKeywords = new Set(newSummary.split(/\s+/).filter(w => w.length > 3));

  for (const week of history) {
    for (const entry of week.entries) {
      // Must be same project
      if (entry.project !== finding.project) continue;

      // Check summary similarity
      const entrySummary = entry.summary.toLowerCase();
      const entryKeywords = entrySummary.split(/\s+/).filter(w => w.length > 3);

      // Calculate word overlap
      const overlap = entryKeywords.filter(w => newKeywords.has(w)).length;
      const overlapRatio = overlap / Math.max(newKeywords.size, 1);

      // Also check if key findings overlap significantly
      const entryFindingsText = entry.keyFindings.join(' ').toLowerCase();
      const newFindingsText = finding.keyFindings.join(' ').toLowerCase();
      const findingsOverlap = calculateTextSimilarity(entryFindingsText, newFindingsText);

      // Consider duplicate if >50% word overlap in summary or >40% in findings
      if (overlapRatio > 0.5 || findingsOverlap > 0.4) {
        return {
          isDuplicate: true,
          matchedEntry: entry,
          matchedWeek: week.weekStart,
        };
      }
    }
  }

  return { isDuplicate: false };
}

/**
 * Calculate text similarity using Jaccard index
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 3));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;

  return intersection / union;
}

/**
 * Filter findings to remove duplicates
 */
export async function filterDuplicates(
  findings: ResearchFinding[]
): Promise<{ unique: ResearchFinding[]; duplicates: ResearchFinding[] }> {
  const history = await loadHistory();
  const unique: ResearchFinding[] = [];
  const duplicates: ResearchFinding[] = [];

  for (const finding of findings) {
    const result = isDuplicate(finding, history);
    if (result.isDuplicate) {
      console.log(
        `Duplicate found: "${finding.mostImportantInsight?.slice(0, 50)}..." ` +
          `matches entry from week ${result.matchedWeek}`
      );
      duplicates.push(finding);
    } else {
      unique.push(finding);
    }
  }

  console.log(`Filtered ${duplicates.length} duplicates, ${unique.length} unique findings`);
  return { unique, duplicates };
}

/**
 * Convert history to markdown format
 */
function historyToMarkdown(history: WeeklyHistory[]): string {
  let md = `# Research History

This file tracks the last ${WEEKS_TO_KEEP} weeks of research findings to prevent duplicate reporting.

---

<!-- HISTORY_START - Do not edit this marker -->
`;

  const sorted = [...history].sort(
    (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
  );

  for (const week of sorted) {
    md += `\n## Week of ${week.weekStart}\n\n`;

    // Group entries by project
    const byProject = week.entries.reduce(
      (acc, entry) => {
        if (!acc[entry.project]) acc[entry.project] = [];
        acc[entry.project].push(entry);
        return acc;
      },
      {} as Record<string, HistoryEntry[]>
    );

    for (const [project, entries] of Object.entries(byProject)) {
      md += `### ${project.toUpperCase()}\n\n`;

      for (const entry of entries) {
        md += `- **${entry.category}** (${entry.date})\n`;
        md += `  - ${entry.summary}\n`;
        if (entry.keyFindings.length > 0) {
          md += `  - Key findings:\n`;
          for (const kf of entry.keyFindings.slice(0, 3)) {
            md += `    - ${kf}\n`;
          }
        }
        md += '\n';
      }
    }
  }

  md += '<!-- HISTORY_END - Do not edit this marker -->\n';
  return md;
}

/**
 * Parse markdown history back to data structure
 */
function parseMarkdownHistory(content: string): WeeklyHistory[] {
  const history: WeeklyHistory[] = [];

  // Extract content between markers
  const startMarker = '<!-- HISTORY_START - Do not edit this marker -->';
  const endMarker = '<!-- HISTORY_END - Do not edit this marker -->';

  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1) return [];

  const historyContent = content.slice(startIdx + startMarker.length, endIdx);

  // Parse weeks
  const weekMatches = historyContent.matchAll(/## Week of (\d{4}-\d{2}-\d{2})/g);
  const weekStarts: string[] = [];

  for (const match of weekMatches) {
    weekStarts.push(match[1]);
  }

  // For now, return empty history if parsing is complex
  // The KV storage is the source of truth anyway
  // This is mainly for human readability

  return history;
}

/**
 * Get history summary for display
 */
export async function getHistorySummary(): Promise<{
  weeksTracked: number;
  totalEntries: number;
  entriesByProject: Record<string, number>;
}> {
  const history = await loadHistory();

  const entriesByProject: Record<string, number> = {};
  let totalEntries = 0;

  for (const week of history) {
    for (const entry of week.entries) {
      totalEntries++;
      entriesByProject[entry.project] = (entriesByProject[entry.project] || 0) + 1;
    }
  }

  return {
    weeksTracked: history.length,
    totalEntries,
    entriesByProject,
  };
}
