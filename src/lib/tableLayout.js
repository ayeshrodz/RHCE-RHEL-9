/** Size columns by typical reading length; isolated long commands cannot dominate. */
export function tableColumnWidths(labels, rows) {
  if (!labels.length) return [];
  const scores = labels.map((label, column) => {
    const lengths = rows
      .map((row) => (row[column] ?? '').replace(/\s+/g, ' ').trim().length)
      .filter(Boolean)
      .sort((a, b) => a - b);
    const typical = lengths[Math.floor((lengths.length - 1) * 0.75)] ?? 0;
    return Math.max(16, Math.min(180, Math.max(label.length, typical)));
  });
  const total = scores.reduce((sum, score) => sum + score, 0);
  // Reserve equal space for every column, then distribute the rest by its content.
  return scores.map((score) => 30 / labels.length + (70 * score) / total);
}
