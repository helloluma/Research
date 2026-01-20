/**
 * Urgent Item Tracker
 * Saves and loads urgent items to compare between morning and evening runs
 * Uses Vercel KV if available, falls back to in-memory storage for development
 */

import { kv } from '@vercel/kv';
import { UrgentItem, DailyUrgentItems, ResearchFinding, ProjectName } from '@/types';

// Key prefix for KV storage
const KV_PREFIX = 'research_urgent_';

// In-memory fallback for development
let memoryStore: DailyUrgentItems | null = null;

/**
 * Get today's date key
 */
function getTodayKey(): string {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Check if Vercel KV is available
 */
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * Convert a research finding to an urgent item
 */
export function findingToUrgentItem(finding: ResearchFinding): UrgentItem {
  return {
    project: finding.project,
    summary: finding.mostImportantInsight || finding.keyFindings[0] || finding.query,
    source: finding.sources[0]?.url || '',
    priority: finding.priority,
    category: finding.category,
    timestamp: finding.timestamp,
  };
}

/**
 * Get urgent items from findings
 */
export function extractUrgentItems(findings: ResearchFinding[]): UrgentItem[] {
  return findings
    .filter(f => f.priority === 'urgent' || f.priority === 'high')
    .map(findingToUrgentItem);
}

/**
 * Save morning urgent items
 */
export async function saveMorningUrgentItems(items: UrgentItem[]): Promise<void> {
  const today = getTodayKey();
  const data: DailyUrgentItems = {
    date: today,
    morningUrgentItems: items,
    lastMorningRun: new Date().toISOString(),
  };

  if (isKVAvailable()) {
    try {
      await kv.set(`${KV_PREFIX}${today}`, data, {
        ex: 86400 * 2, // Expire after 2 days
      });
      console.log(`Saved ${items.length} morning urgent items to KV`);
    } catch (error) {
      console.error('Failed to save to KV, using memory fallback:', error);
      memoryStore = data;
    }
  } else {
    console.log('KV not available, using memory storage');
    memoryStore = data;
  }
}

/**
 * Load morning urgent items for comparison in evening
 */
export async function loadMorningUrgentItems(): Promise<UrgentItem[]> {
  const today = getTodayKey();

  if (isKVAvailable()) {
    try {
      const data = await kv.get<DailyUrgentItems>(`${KV_PREFIX}${today}`);
      if (data) {
        console.log(`Loaded ${data.morningUrgentItems.length} morning urgent items from KV`);
        return data.morningUrgentItems;
      }
    } catch (error) {
      console.error('Failed to load from KV:', error);
    }
  }

  // Fallback to memory
  if (memoryStore && memoryStore.date === today) {
    console.log(`Loaded ${memoryStore.morningUrgentItems.length} morning urgent items from memory`);
    return memoryStore.morningUrgentItems;
  }

  console.log('No morning urgent items found');
  return [];
}

/**
 * Update with evening urgent items
 */
export async function saveEveningUrgentItems(items: UrgentItem[]): Promise<void> {
  const today = getTodayKey();

  if (isKVAvailable()) {
    try {
      const existing = await kv.get<DailyUrgentItems>(`${KV_PREFIX}${today}`);
      const data: DailyUrgentItems = {
        ...existing,
        date: today,
        morningUrgentItems: existing?.morningUrgentItems || [],
        eveningUrgentItems: items,
        lastEveningRun: new Date().toISOString(),
      };
      await kv.set(`${KV_PREFIX}${today}`, data, {
        ex: 86400 * 2,
      });
      console.log(`Saved ${items.length} evening urgent items to KV`);
    } catch (error) {
      console.error('Failed to save evening items to KV:', error);
      if (memoryStore) {
        memoryStore.eveningUrgentItems = items;
        memoryStore.lastEveningRun = new Date().toISOString();
      }
    }
  } else if (memoryStore) {
    memoryStore.eveningUrgentItems = items;
    memoryStore.lastEveningRun = new Date().toISOString();
  }
}

/**
 * Filter out items that were already reported in the morning
 */
export function filterNewUrgentItems(
  eveningItems: UrgentItem[],
  morningItems: UrgentItem[]
): UrgentItem[] {
  return eveningItems.filter(eveningItem => {
    // Check if this item (or something very similar) was in the morning
    const isDuplicate = morningItems.some(morningItem => {
      // Same project and similar summary
      if (morningItem.project !== eveningItem.project) return false;

      // Check if summaries are similar (simple word overlap)
      const eveningWords = new Set(eveningItem.summary.toLowerCase().split(/\s+/));
      const morningWords = morningItem.summary.toLowerCase().split(/\s+/);
      const overlap = morningWords.filter(w => eveningWords.has(w)).length;
      const overlapRatio = overlap / Math.max(morningWords.length, 1);

      return overlapRatio > 0.5;
    });

    return !isDuplicate;
  });
}

/**
 * Get the last run timestamps
 */
export async function getLastRunTimestamps(): Promise<{
  lastMorningRun: string | null;
  lastEveningRun: string | null;
}> {
  const today = getTodayKey();

  if (isKVAvailable()) {
    try {
      const data = await kv.get<DailyUrgentItems>(`${KV_PREFIX}${today}`);
      if (data) {
        return {
          lastMorningRun: data.lastMorningRun || null,
          lastEveningRun: data.lastEveningRun || null,
        };
      }
    } catch (error) {
      console.error('Failed to get timestamps from KV:', error);
    }
  }

  // Check memory fallback
  if (memoryStore && memoryStore.date === today) {
    return {
      lastMorningRun: memoryStore.lastMorningRun || null,
      lastEveningRun: memoryStore.lastEveningRun || null,
    };
  }

  return {
    lastMorningRun: null,
    lastEveningRun: null,
  };
}

/**
 * Get full daily data for status page
 */
export async function getDailyData(): Promise<DailyUrgentItems | null> {
  const today = getTodayKey();

  if (isKVAvailable()) {
    try {
      return await kv.get<DailyUrgentItems>(`${KV_PREFIX}${today}`);
    } catch (error) {
      console.error('Failed to get daily data from KV:', error);
    }
  }

  return memoryStore;
}

/**
 * Create a summary of urgent items by project
 */
export function summarizeUrgentItems(items: UrgentItem[]): Record<ProjectName, number> {
  const summary: Record<ProjectName, number> = {
    sponsorbase: 0,
    luma: 0,
    marina: 0,
  };

  items.forEach(item => {
    summary[item.project]++;
  });

  return summary;
}
