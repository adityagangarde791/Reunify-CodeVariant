// REUNIFY SMART MATCHING ENGINE
// Deterministic, explainable rule-based scoring engine for Lost & Found recovery

import { Item, MatchCandidate, MatchScoreReason } from '../types';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'in', 'on', 'at', 'with', 'and', 'or', 'of', 'for',
  'is', 'to', 'from', 'by', 'it', 'my', 'i', 'was', 'found', 'lost', 'left'
]);

/**
 * Normalizes a text string into an array of meaningful unique tokens
 */
export function extractSignificantTokens(text?: string): string[] {
  if (!text) return [];
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    )
  );
}

/**
 * Calculates Jaccard token overlap similarity (0 to 1)
 */
export function calculateJaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  
  let intersectionCount = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersectionCount++;
    }
  }

  const unionSize = new Set([...tokensA, ...tokensB]).size;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

/**
 * Scores the match between a Lost item and a Found item.
 * Excludes same items, incompatible types, or closed items.
 */
export function evaluateItemPair(lost: Item, found: Item): { score: number; reasons: MatchScoreReason[] } | null {
  if (lost.id === found.id) return null;

  const lostType = lost.report_type || lost.type;
  const foundType = found.report_type || found.type;

  // Must be 1 lost and 1 found
  if (!lostType || !foundType || lostType === foundType) return null;

  // Exclude closed or returned items
  if (lost.status === 'closed' || lost.status === 'cancelled' || lost.status === 'returned') return null;
  if (found.status === 'closed' || found.status === 'cancelled' || found.status === 'returned') return null;

  const reasons: MatchScoreReason[] = [];
  let totalScore = 0;

  // 1. Category Matching (Max 30 points)
  if (lost.category === found.category) {
    totalScore += 30;
    reasons.push({
      criterion: 'category',
      points: 30,
      max: 30,
      detail: `Identical category match: ${lost.category.replace('_', ' ')}`,
    });
  } else {
    reasons.push({
      criterion: 'category',
      points: 0,
      max: 30,
      detail: `Different categories (${lost.category} vs ${found.category})`,
    });
  }

  // 2. Normalized Title Token Overlap (Max 25 points)
  const lostTitleTokens = extractSignificantTokens(lost.title);
  const foundTitleTokens = extractSignificantTokens(found.title);
  const titleSimilarity = calculateJaccardSimilarity(lostTitleTokens, foundTitleTokens);
  
  const titlePoints = Math.round(titleSimilarity * 25);
  totalScore += titlePoints;
  
  const sharedTokens = lostTitleTokens.filter((t) => foundTitleTokens.includes(t));
  reasons.push({
    criterion: 'title_tokens',
    points: titlePoints,
    max: 25,
    detail: sharedTokens.length > 0 
      ? `Shared title keywords: ${sharedTokens.join(', ')}`
      : 'No matching primary title keywords',
  });

  // 3. Location Proximity (Max 20 points)
  let locationPoints = 0;
  let locationDetail = 'Different campus locations';

  const cleanLoc = (s?: string) => (s || '').toLowerCase().trim();
  const lostBuilding = cleanLoc(lost.location_building);
  const foundBuilding = cleanLoc(found.location_building);
  const lostZone = cleanLoc(lost.campus_zone);
  const foundZone = cleanLoc(found.campus_zone);
  const lostName = cleanLoc(lost.location_name || lost.location);
  const foundName = cleanLoc(found.location_name || found.location);

  if (lostName && foundName && (lostName.includes(foundName) || foundName.includes(lostName))) {
    locationPoints = 20;
    locationDetail = `Identical specific location: ${lost.location_name || lost.location}`;
  } else if (lostBuilding && foundBuilding && lostBuilding === foundBuilding) {
    locationPoints = 16;
    locationDetail = `Matching campus building: ${lost.location_building}`;
  } else if (lostZone && foundZone && lostZone === foundZone) {
    locationPoints = 10;
    locationDetail = `Same campus sector / zone: ${lost.campus_zone}`;
  } else {
    const locTokenSim = calculateJaccardSimilarity(
      extractSignificantTokens(lostName),
      extractSignificantTokens(foundName)
    );
    if (locTokenSim > 0.3) {
      locationPoints = Math.round(locTokenSim * 12);
      locationDetail = `Partial location keyword similarity in ${lost.location_name || lost.location}`;
    }
  }

  totalScore += locationPoints;
  reasons.push({
    criterion: 'location',
    points: locationPoints,
    max: 20,
    detail: locationDetail,
  });

  // 4. Temporal Proximity (Max 15 points)
  let temporalPoints = 0;
  let temporalDetail = 'Reports separated by over two weeks';

  try {
    const lostDateStr = lost.incident_date || lost.date_lost_or_found || lost.created_at;
    const foundDateStr = found.incident_date || found.date_lost_or_found || found.created_at;

    const lostDate = new Date(lostDateStr).getTime();
    const foundDate = new Date(foundDateStr).getTime();
    const diffHours = Math.abs(foundDate - lostDate) / (1000 * 60 * 60);

    if (diffHours <= 24) {
      temporalPoints = 15;
      temporalDetail = `Reported within 24 hours (${Math.round(diffHours)}h difference)`;
    } else if (diffHours <= 72) {
      temporalPoints = 12;
      temporalDetail = `Reported within 3 days (${Math.round(diffHours / 24)}d difference)`;
    } else if (diffHours <= 168) { // 7 days
      temporalPoints = 8;
      temporalDetail = `Reported within 1 week of each other`;
    } else if (diffHours <= 336) { // 14 days
      temporalPoints = 4;
      temporalDetail = `Reported within 2 weeks of each other`;
    }
  } catch {
    temporalPoints = 0;
  }

  totalScore += temporalPoints;
  reasons.push({
    criterion: 'temporal',
    points: temporalPoints,
    max: 15,
    detail: temporalDetail,
  });

  // 5. Description Characteristics Overlap (Max 10 points)
  const lostDescTokens = extractSignificantTokens(lost.description);
  const foundDescTokens = extractSignificantTokens(found.description);
  const descSimilarity = calculateJaccardSimilarity(lostDescTokens, foundDescTokens);
  const descPoints = Math.round(descSimilarity * 10);
  
  totalScore += descPoints;
  const sharedDescTokens = lostDescTokens.filter((t) => foundDescTokens.includes(t));
  reasons.push({
    criterion: 'description',
    points: descPoints,
    max: 10,
    detail: sharedDescTokens.length > 0
      ? `Shared descriptive clues: ${sharedDescTokens.slice(0, 4).join(', ')}`
      : 'No common descriptive traits',
  });

  // Clamp score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, totalScore));

  return {
    score: finalScore,
    reasons,
  };
}

/**
 * Finds all candidate matches for a given item against a pool of items.
 * Ranks candidates by score in descending order.
 */
export function findMatchesForItem(targetItem: Item, itemsPool: Item[], minThreshold = 35): MatchCandidate[] {
  const candidates: MatchCandidate[] = [];
  const targetType = targetItem.report_type || targetItem.type;

  for (const item of itemsPool) {
    const itemType = item.report_type || item.type;
    const isLostToFound = targetType === 'lost' && itemType === 'found';
    const isFoundToLost = targetType === 'found' && itemType === 'lost';

    if (!isLostToFound && !isFoundToLost) continue;

    const lostItem = isLostToFound ? targetItem : item;
    const foundItem = isLostToFound ? item : targetItem;

    const evaluation = evaluateItemPair(lostItem, foundItem);
    if (evaluation && evaluation.score >= minThreshold) {
      candidates.push({
        id: `match-${lostItem.id}-${foundItem.id}`,
        lost_item: lostItem,
        found_item: foundItem,
        score: evaluation.score,
        reasons: evaluation.reasons,
        status: 'suggested',
        created_at: new Date().toISOString(),
      });
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
}
