import { describe, it, expect } from 'vitest';
import { 
  extractSignificantTokens, 
  calculateJaccardSimilarity, 
  evaluateItemPair, 
  findMatchesForItem 
} from './matchingEngine';
import { Item } from '../types';

describe('Smart Matching Engine', () => {
  it('normalizes tokens and ignores punctuation & stop words', () => {
    const text = 'Found a blue Apple AirPods Pro case with a small scratch on the hinge!';
    const tokens = extractSignificantTokens(text);
    
    expect(tokens).toContain('blue');
    expect(tokens).toContain('apple');
    expect(tokens).toContain('airpods');
    expect(tokens).toContain('case');
    expect(tokens).toContain('scratch');
    expect(tokens).not.toContain('with');
    expect(tokens).not.toContain('on');
    expect(tokens).not.toContain('the');
  });

  it('calculates Jaccard similarity accurately', () => {
    const setA = ['apple', 'airpods', 'blue'];
    const setB = ['apple', 'airpods', 'white'];
    // 2 shared out of 4 total unique = 0.5
    expect(calculateJaccardSimilarity(setA, setB)).toBe(0.5);

    expect(calculateJaccardSimilarity(['a'], ['b'])).toBe(0);
    expect(calculateJaccardSimilarity([], ['b'])).toBe(0);
  });

  const baseLost: Item = {
    id: 'lost-1',
    user_id: 'user-1',
    type: 'lost',
    title: 'Apple AirPods Pro in Navy Case',
    category: 'electronics',
    description: 'Matte silicone case with a small silver clip',
    location_name: 'Main Library 2nd Floor',
    location_building: 'Main Library',
    campus_zone: 'Central Campus',
    date_lost_or_found: new Date('2026-10-20T10:00:00Z').toISOString(),
    status: 'active',
    created_at: new Date('2026-10-20T11:00:00Z').toISOString(),
    updated_at: new Date('2026-10-20T11:00:00Z').toISOString(),
  };

  const matchingFound: Item = {
    id: 'found-1',
    user_id: 'user-2',
    type: 'found',
    title: 'AirPods Pro with Navy Sleeve',
    category: 'electronics',
    description: 'Found left on quiet desk with small metal clip',
    location_name: 'Main Library 2nd Floor Study Desks',
    location_building: 'Main Library',
    campus_zone: 'Central Campus',
    date_lost_or_found: new Date('2026-10-20T14:00:00Z').toISOString(),
    status: 'active',
    created_at: new Date('2026-10-20T15:00:00Z').toISOString(),
    updated_at: new Date('2026-10-20T15:00:00Z').toISOString(),
  };

  const differentCategoryFound: Item = {
    id: 'found-2',
    user_id: 'user-3',
    type: 'found',
    title: 'Prescription Glasses in Black Case',
    category: 'eyewear',
    description: 'Reading glasses found near library podium',
    location_name: 'Main Library 1st Floor',
    location_building: 'Main Library',
    campus_zone: 'Central Campus',
    date_lost_or_found: new Date('2026-10-20T10:00:00Z').toISOString(),
    status: 'active',
    created_at: new Date('2026-10-20T12:00:00Z').toISOString(),
    updated_at: new Date('2026-10-20T12:00:00Z').toISOString(),
  };

  it('awards high score with detailed reasons to closely matching items', () => {
    const evaluation = evaluateItemPair(baseLost, matchingFound);
    expect(evaluation).not.toBeNull();
    if (!evaluation) return;

    expect(evaluation.score).toBeGreaterThan(60);
    expect(evaluation.reasons).toHaveLength(5);

    const catReason = evaluation.reasons.find((r) => r.criterion === 'category');
    expect(catReason?.points).toBe(30);

    const locReason = evaluation.reasons.find((r) => r.criterion === 'location');
    expect(locReason?.points).toBeGreaterThan(15);
  });

  it('penalizes items of completely different categories', () => {
    const evaluation = evaluateItemPair(baseLost, differentCategoryFound);
    expect(evaluation).not.toBeNull();
    if (!evaluation) return;

    expect(evaluation.score).toBeLessThan(40);
    const catReason = evaluation.reasons.find((r) => r.criterion === 'category');
    expect(catReason?.points).toBe(0);
  });

  it('refuses to evaluate items of the same type or closed status', () => {
    expect(evaluateItemPair(baseLost, { ...matchingFound, type: 'lost' })).toBeNull();
    expect(evaluateItemPair({ ...baseLost, status: 'returned' }, matchingFound)).toBeNull();
  });

  it('ranks candidates by similarity score in descending order', () => {
    const matches = findMatchesForItem(baseLost, [matchingFound, differentCategoryFound], 20);
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches[0].found_item.id).toBe('found-1');
  });
});
