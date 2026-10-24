import { describe, it, expect } from 'vitest';

interface ActionPair {
  cardId: string;
  targetZoneId: string;
  actionName: string;
  route: string;
}

const PROTOCOL_ACTIONS: ActionPair[] = [
  { cardId: 'card-lost', targetZoneId: 'zone-lost', actionName: 'Report Lost Item', route: '/report/lost' },
  { cardId: 'card-found', targetZoneId: 'zone-found', actionName: 'Report Found Item', route: '/report/found' },
  { cardId: 'card-explore', targetZoneId: 'zone-explore', actionName: 'Explore Campus Items', route: '/explore' },
  { cardId: 'card-matches', targetZoneId: 'zone-matches', actionName: 'Deterministic Smart Matches', route: '/matches' },
  { cardId: 'card-cases', targetZoneId: 'zone-cases', actionName: 'Inspect My Cases & Claims', route: '/my-cases' },
  { cardId: 'card-notifs', targetZoneId: 'zone-notifs', actionName: 'Campus Security Alerts', route: '/notifications' },
];

function validateDrop(draggedCardId: string, droppedZoneId: string): boolean {
  const match = PROTOCOL_ACTIONS.find((a) => a.cardId === draggedCardId);
  return Boolean(match && match.targetZoneId === droppedZoneId);
}

describe('Canvas Protocol Rules & Drop Verification Engine', () => {
  it('strictly validates intentional drops into matching zones', () => {
    expect(validateDrop('card-lost', 'zone-lost')).toBe(true);
    expect(validateDrop('card-found', 'zone-found')).toBe(true);
    expect(validateDrop('card-explore', 'zone-explore')).toBe(true);
    expect(validateDrop('card-matches', 'zone-matches')).toBe(true);
    expect(validateDrop('card-cases', 'zone-cases')).toBe(true);
    expect(validateDrop('card-notifs', 'zone-notifs')).toBe(true);
  });

  it('rejects incorrect or mismatched card drops', () => {
    // Attempting to drop Explore into Report Lost
    expect(validateDrop('card-explore', 'zone-lost')).toBe(false);
    // Attempting to drop Lost into Found
    expect(validateDrop('card-lost', 'zone-found')).toBe(false);
    // Attempting to drop Cases into Notifications
    expect(validateDrop('card-cases', 'zone-notifs')).toBe(false);
    // Non-existent zone
    expect(validateDrop('card-lost', 'zone-invalid')).toBe(false);
  });

  it('verifies all primary protocol routes are uniquely mapped', () => {
    const routes = PROTOCOL_ACTIONS.map((a) => a.route);
    const uniqueRoutes = new Set(routes);
    expect(uniqueRoutes.size).toBe(PROTOCOL_ACTIONS.length);
  });

  it('ensures every card has a designated reciprocal action zone', () => {
    PROTOCOL_ACTIONS.forEach((action) => {
      expect(action.cardId).toBeDefined();
      expect(action.targetZoneId).toBeDefined();
      expect(action.targetZoneId.startsWith('zone-')).toBe(true);
      expect(action.cardId.startsWith('card-')).toBe(true);
    });
  });
});
