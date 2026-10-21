/**
 * Logbook default tabs (Sergio, Oct 21 2026): each pane opens on the first tab in its
 * priority order that has content at the active command. Empty tabs stay clickable;
 * they are only skipped as the default. Falls back to the first tab in the order.
 */
export type TabCounts<T extends string> = Partial<Record<T, number>>;

export function pickDefaultTab<T extends string>(order: readonly T[], counts: TabCounts<T>): T {
  return order.find((id) => (counts[id] ?? 0) > 0) ?? order[0];
}

/** Keep a tab the visitor picked by hand if it still has content here; otherwise use the default. */
export function keepOrDefault<T extends string>(picked: T | null, order: readonly T[], counts: TabCounts<T>): T {
  return picked != null && (counts[picked] ?? 0) > 0 ? picked : pickDefaultTab(order, counts);
}

export const MAIN_ORDER = ["rank", "admin", "photos"] as const;
export const PHONE_ORDER = ["crests", "onduty", "map", "uniforms", "wardrobe", "offduty"] as const;
export const ASIDE_ORDER = ["onduty", "uniforms", "wardrobe", "offduty"] as const;
