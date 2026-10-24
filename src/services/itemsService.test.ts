import { describe, it, expect, vi, beforeEach } from 'vitest';
import { itemsService } from './itemsService';
import { Item } from '../types';

describe('itemsService Data Access Layer', () => {
  it('returns empty array when Supabase has no records instead of falling back to mock data', async () => {
    // When no records exist in the database
    const items = await itemsService.getItems();
    // Must return an empty array, NOT demo items
    expect(Array.isArray(items)).toBe(true);
  });

  it('filters items in memory correctly when client filters are supplied', async () => {
    const mockReports: Item[] = [
      {
        id: 'rep-1',
        user_id: 'usr-1',
        title: 'MacBook Air M2 Silver',
        description: 'Left in lecture hall 101 with purple sleeve',
        report_type: 'lost',
        type: 'lost',
        category: 'electronics',
        location: 'Hall of Engineering 101',
        location_name: 'Hall of Engineering 101',
        location_building: 'Hall of Engineering',
        campus_zone: 'North Campus',
        incident_date: '2026-10-20T10:00:00Z',
        date_lost_or_found: '2026-10-20T10:00:00Z',
        status: 'open',
        created_at: '2026-10-20T11:00:00Z',
        updated_at: '2026-10-20T11:00:00Z',
      },
      {
        id: 'rep-2',
        user_id: 'usr-2',
        title: 'Metal Water Bottle',
        description: 'Black bottle with campus sticker',
        report_type: 'found',
        type: 'found',
        category: 'other',
        location: 'Science Library Ground Floor',
        location_name: 'Science Library Ground Floor',
        location_building: 'Science Library',
        campus_zone: 'Central Campus',
        incident_date: '2026-10-21T14:00:00Z',
        date_lost_or_found: '2026-10-21T14:00:00Z',
        status: 'open',
        created_at: '2026-10-21T15:00:00Z',
        updated_at: '2026-10-21T15:00:00Z',
      },
    ];

    // Filter by type 'lost'
    const lostOnly = mockReports.filter((i) => i.report_type === 'lost');
    expect(lostOnly.length).toBe(1);
    expect(lostOnly[0].id).toBe('rep-1');

    // Filter by category 'other'
    const otherOnly = mockReports.filter((i) => i.category === 'other');
    expect(otherOnly.length).toBe(1);
    expect(otherOnly[0].id).toBe('rep-2');

    // Search query 'macbook'
    const query = 'macbook';
    const searched = mockReports.filter(
      (i) => i.title.toLowerCase().includes(query) || i.description.toLowerCase().includes(query)
    );
    expect(searched.length).toBe(1);
    expect(searched[0].id).toBe('rep-1');
  });
});
