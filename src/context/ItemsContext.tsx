import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Item, Claim, InAppNotification, CaseTimelineEvent, FilterState, MatchCandidate } from '../types';
import { itemsService } from '../services/itemsService';
import { useAuth } from './AuthContext';
import { findMatchesForItem } from '../services/matchingEngine';

interface ItemsContextType {
  items: Item[];
  claims: Claim[];
  notifications: InAppNotification[];
  unreadNotifsCount: number;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  getItemById: (id: string) => Promise<Item | null>;
  getTimelineForItem: (itemId: string) => Promise<CaseTimelineEvent[]>;
  getClaimById: (claimId: string) => Promise<Claim | null>;
  createReport: (
    data: Omit<Item, 'id' | 'created_at' | 'updated_at' | 'status' | 'user_id'>
  ) => Promise<Item>;
  deleteReport: (id: string) => Promise<boolean>;
  uploadPhoto: (file: File) => Promise<string>;
  submitClaim: (itemId: string, proof: string, proofImageUrl?: string) => Promise<Claim>;
  reviewClaim: (claimId: string, approved: boolean, notes: string, handoverLocation?: string) => Promise<Claim | null>;
  confirmHandover: (claimId: string) => Promise<boolean>;
  markNotificationRead: (notifId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  getSmartMatches: (itemId: string) => MatchCandidate[];
  getAllSmartMatches: () => MatchCandidate[];
  toastMessage: string | null;
  toastType: 'success' | 'info' | 'error' | null;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error' | null>(null);

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
      setToastType(null);
    }, 4000);
  };

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedItems = await itemsService.getItems();
      setItems(fetchedItems);

      if (user) {
        // If staff or admin, fetch all claims for moderation; otherwise fetch user's claims
        const isStaff = role === 'campus_security' || role === 'admin';
        const fetchedClaims = await itemsService.getClaims(isStaff ? undefined : { claimantId: user.id });
        setClaims(fetchedClaims);

        const fetchedNotifs = await itemsService.getNotifications(user.id);
        setNotifications(fetchedNotifs);
      } else {
        setClaims([]);
        setNotifications([]);
      }
    } catch (e: unknown) {
      console.warn('Items loading info:', e instanceof Error ? e.message : e);
    } finally {
      setIsLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const getItemById = async (id: string): Promise<Item | null> => {
    const existing = items.find((i) => i.id === id);
    if (existing) return existing;
    return itemsService.getItemById(id);
  };

  const getTimelineForItem = async (itemId: string) => {
    return itemsService.getTimelineForItem(itemId);
  };

  const getClaimById = async (claimId: string) => {
    const existing = claims.find((c) => c.id === claimId);
    if (existing) return existing;
    return itemsService.getClaimById(claimId);
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    return itemsService.uploadPhoto(file);
  };

  const createReport = async (
    data: Omit<Item, 'id' | 'created_at' | 'updated_at' | 'status' | 'user_id'>
  ): Promise<Item> => {
    if (!user) throw new Error('You must be signed in to submit a report');

    const created = await itemsService.createItem(
      {
        ...data,
        user_id: user.id,
      },
      user
    );

    showToast(`Report created successfully: "${created.title}"`, 'success');
    await refreshData();
    return created;
  };

  const deleteReport = async (id: string): Promise<boolean> => {
    if (!user) throw new Error('Must be signed in to delete report');
    const success = await itemsService.deleteItem(id);
    if (success) {
      showToast('Report deleted successfully.', 'info');
      await refreshData();
    }
    return success;
  };

  const submitClaim = async (itemId: string, proof: string, proofImageUrl?: string): Promise<Claim> => {
    if (!user) throw new Error('Must be signed in to submit a claim');

    const createdClaim = await itemsService.submitClaim(itemId, user, proof, proofImageUrl);
    showToast('Your ownership claim has been submitted for review.', 'success');
    await refreshData();
    return createdClaim;
  };

  const reviewClaim = async (
    claimId: string,
    approved: boolean,
    notes: string,
    handoverLocation?: string
  ): Promise<Claim | null> => {
    if (!user) throw new Error('Must be signed in to review claims');

    const updated = await itemsService.reviewClaim(claimId, user, approved, notes, handoverLocation);
    showToast(
      approved ? 'Claim approved! Handover pass issued.' : 'Claim declined.',
      approved ? 'success' : 'info'
    );
    await refreshData();
    return updated;
  };

  const confirmHandover = async (claimId: string): Promise<boolean> => {
    if (!user) throw new Error('Must be signed in');
    const officerName = user.full_name;
    const success = await itemsService.completeHandover(claimId, officerName);
    if (success) {
      showToast('Handover confirmed! Item marked as returned.', 'success');
      await refreshData();
    }
    return success;
  };

  const markNotificationRead = async (notifId: string) => {
    await itemsService.markNotificationRead(notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    await itemsService.markAllNotificationsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    showToast('All notifications marked as read', 'info');
  };

  const getSmartMatches = (itemId: string): MatchCandidate[] => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return [];
    return findMatchesForItem(item, items, 40);
  };

  const getAllSmartMatches = (): MatchCandidate[] => {
    const lostItems = items.filter((i) => i.type === 'lost' && i.status !== 'returned' && i.status !== 'closed');
    const allMatches: MatchCandidate[] = [];
    const seenPairs = new Set<string>();

    for (const lost of lostItems) {
      const candidates = findMatchesForItem(lost, items, 45);
      for (const cand of candidates) {
        const pairKey = `${cand.lost_item.id}-${cand.found_item.id}`;
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          allMatches.push(cand);
        }
      }
    }

    return allMatches.sort((a, b) => b.score - a.score);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.is_read).length;

  return (
    <ItemsContext.Provider
      value={{
        items,
        claims,
        notifications,
        unreadNotifsCount,
        isLoading,
        refreshData,
        getItemById,
        getTimelineForItem,
        getClaimById,
        createReport,
        deleteReport,
        uploadPhoto,
        submitClaim,
        reviewClaim,
        confirmHandover,
        markNotificationRead,
        markAllNotificationsRead,
        getSmartMatches,
        getAllSmartMatches,
        toastMessage,
        toastType,
        showToast,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (!context) throw new Error('useItems must be used within an ItemsProvider');
  return context;
};
