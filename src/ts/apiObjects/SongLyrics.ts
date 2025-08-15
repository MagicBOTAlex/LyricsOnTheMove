type RawLyricLine = {
  startTimeMs: string;
  words: string;
  syllables: string[];
  endTimeMs: string;
};

type LyricLine = RawLyricLine & {
  // Parsed numeric timestamps (ms)
  startTime: number;
  endTime: number;
};

export class SongLyrics {
  error: boolean;
  syncType: string;
  lines: LyricLine[];

  constructor(data: {
    error: boolean;
    syncType: string;
    lines: RawLyricLine[];
  }) {
    this.error = data.error;
    this.syncType = data.syncType;

    const toMs = (v: string | number | undefined | null): number => {
      const n = typeof v === "number" ? v : Number(v ?? 0);
      return Number.isFinite(n) ? n : 0;
    };

    // Sort by numeric start time
    const sorted = [...(data.lines ?? [])].sort(
      (a, b) => toMs(a.startTimeMs) - toMs(b.startTimeMs),
    );

    // If last row is a blank "end marker", capture and drop it
    let terminalEnd = 0;
    if (
      sorted.length > 0 &&
      (sorted[sorted.length - 1].words ?? "").trim() === ""
    ) {
      terminalEnd = toMs(sorted[sorted.length - 1].startTimeMs);
      sorted.pop();
    }

    // Build normalized lines with fixed end times and parsed numbers
    const fixed: LyricLine[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i];
      const next = sorted[i + 1];

      const startNum = toMs(cur.startTimeMs);
      const endNum = next ? toMs(next.startTimeMs) : terminalEnd || startNum;

      fixed.push({
        words: cur.words,
        syllables: cur.syllables ?? [],
        // normalized string fields
        startTimeMs: String(startNum),
        endTimeMs: String(endNum),
        // parsed numeric fields
        startTime: startNum,
        endTime: endNum,
      });
    }

    this.lines = fixed;
  }
}
