/**
 * History Tracker
 * Manages privacy score history and tracker timeline
 */

export interface ScoreHistoryEntry {
  date: string;
  score: number;
  timestamp: number;
}

export interface TrackerTimelineEntry {
  timestamp: number;
  count: number;
  hour: number;
}

const SCORE_HISTORY_KEY = 'prism_score_history';
const TRACKER_TIMELINE_KEY = 'prism_tracker_timeline';
const HISTORY_RETENTION_DAYS = 7;

export class HistoryTracker {
  private static instance: HistoryTracker;

  private constructor() {}

  static getInstance(): HistoryTracker {
    if (!HistoryTracker.instance) {
      HistoryTracker.instance = new HistoryTracker();
    }
    return HistoryTracker.instance;
  }

  async recordDailyScore(score: number): Promise<void> {
    try {
      const result = await chrome.storage.local.get(SCORE_HISTORY_KEY);
      const history: ScoreHistoryEntry[] = result[SCORE_HISTORY_KEY] || [];

      const today = new Date().toISOString().split('T')[0];
      const existingIndex = history.findIndex(entry => entry.date === today);

      const newEntry: ScoreHistoryEntry = {
        date: today,
        score: Math.round(score),
        timestamp: Date.now()
      };

      if (existingIndex >= 0) {
        // Update existing entry
        history[existingIndex] = newEntry;
      } else {
        // Add new entry
        history.push(newEntry);
      }

      // Keep only last 7 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - HISTORY_RETENTION_DAYS);
      const filtered = history.filter(entry => new Date(entry.date) >= cutoffDate);

      // Sort by date
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      await chrome.storage.local.set({ [SCORE_HISTORY_KEY]: filtered });
    } catch (error) {
      console.error('Failed to record daily score:', error);
    }
  }

  async recordTrackerBlock(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(TRACKER_TIMELINE_KEY);
      const timeline: TrackerTimelineEntry[] = result[TRACKER_TIMELINE_KEY] || [];

      const now = Date.now();
      const currentHour = new Date().getHours();

      // Find entry for current hour
      const existingIndex = timeline.findIndex(entry => 
        entry.hour === currentHour && 
        now - entry.timestamp < 3600000 // Within same hour
      );

      if (existingIndex >= 0) {
        // Update existing entry
        timeline[existingIndex].count++;
        timeline[existingIndex].timestamp = now;
      } else {
        // Add new entry
        timeline.push({
          timestamp: now,
          count: 1,
          hour: currentHour
        });
      }

      // Keep only last 7 days
      const cutoffTime = now - (HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000);
      const filtered = timeline.filter(entry => entry.timestamp >= cutoffTime);

      // Sort by timestamp
      filtered.sort((a, b) => a.timestamp - b.timestamp);

      await chrome.storage.local.set({ [TRACKER_TIMELINE_KEY]: filtered });
    } catch (error) {
      console.error('Failed to record tracker block:', error);
    }
  }

  async getScoreHistory(): Promise<ScoreHistoryEntry[]> {
    try {
      const result = await chrome.storage.local.get(SCORE_HISTORY_KEY);
      return result[SCORE_HISTORY_KEY] || [];
    } catch (error) {
      console.error('Failed to get score history:', error);
      return [];
    }
  }

  async getTrackerTimeline(): Promise<TrackerTimelineEntry[]> {
    try {
      const result = await chrome.storage.local.get(TRACKER_TIMELINE_KEY);
      return result[TRACKER_TIMELINE_KEY] || [];
    } catch (error) {
      console.error('Failed to get tracker timeline:', error);
      return [];
    }
  }

  async clearHistory(): Promise<void> {
    try {
      await chrome.storage.local.remove([SCORE_HISTORY_KEY, TRACKER_TIMELINE_KEY]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  }
}
