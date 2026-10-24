// REUNIFY PRODUCTION DATA ACCESS LAYER & SERVICES
// Integrates with Supabase PostgreSQL, Auth, and Storage.
// Demo/Mock seed data has been completely eliminated. Real persistence only.

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Item, Claim, InAppNotification, CaseTimelineEvent, FilterState, Profile } from '../types';
import { findMatchesForItem } from './matchingEngine';

// Transform database row from 'reports' into full application Item
function mapReportRowToItem(row: Record<string, any>, authorProfile?: Partial<Profile>): Item {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    report_type: row.report_type,
    type: row.report_type, // UI alias
    category: row.category,
    location: row.location,
    location_name: row.location, // UI alias
    location_building: row.location_building || (row.location ? row.location.split(',')[0] : 'Campus'),
    campus_zone: row.campus_zone || 'Central Campus',
    incident_date: row.incident_date,
    date_lost_or_found: row.incident_date, // UI alias
    status: row.status,
    image_url: row.image_url,
    primary_image_url: row.image_url, // UI alias
    contact_preference: row.contact_preference || 'in_app',
    custody_location: row.custody_location,
    confidential_notes: row.confidential_notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author_name: authorProfile?.full_name || row.profiles?.full_name || 'Campus Member',
    author_role: authorProfile?.role || row.profiles?.role || 'student',
  };
}

export const itemsService = {
  // Upload photo to Supabase Storage bucket 'report-photos'
  uploadPhoto: async (file: File): Promise<string> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `reports/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('report-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Photo upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('report-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // Fetch Items from Supabase with optional filtering
  getItems: async (filters?: Partial<FilterState>): Promise<Item[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      let query = supabase
        .from('reports')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            role,
            email
          )
        `);

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('report_type', filters.type);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.sortBy === 'oldest') {
        query = query.order('incident_date', { ascending: true });
      } else if (filters?.sortBy === 'title') {
        query = query.order('title', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reports from Supabase:', error.message);
        throw new Error(error.message);
      }

      if (!data) return [];

      let items = data.map((row) => mapReportRowToItem(row, row.profiles));

      // Client-side text & location filters for rapid search
      if (filters?.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        items = items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            (item.location && item.location.toLowerCase().includes(q)) ||
            (item.location_name && item.location_name.toLowerCase().includes(q)) ||
            (item.location_building && item.location_building.toLowerCase().includes(q))
        );
      }

      if (filters?.location && filters.location.trim()) {
        const loc = filters.location.toLowerCase().trim();
        items = items.filter(
          (item) =>
            (item.location && item.location.toLowerCase().includes(loc)) ||
            (item.location_name && item.location_name.toLowerCase().includes(loc)) ||
            (item.location_building && item.location_building.toLowerCase().includes(loc)) ||
            (item.campus_zone && item.campus_zone.toLowerCase().includes(loc))
        );
      }

      return items;
    } catch (err: unknown) {
      console.error('Failed to get items:', err);
      throw err;
    }
  },

  // Get single report by ID
  getItemById: async (id: string): Promise<Item | null> => {
    if (!isSupabaseConfigured() || !id) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            role,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return mapReportRowToItem(data, data.profiles);
    } catch (err) {
      console.error('Error fetching item by ID:', err);
      return null;
    }
  },


  // Create new report
  createItem: async (
    itemData: Omit<Item, 'id' | 'created_at' | 'updated_at' | 'status'>,
    authorProfile: Profile
  ): Promise<Item> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Unable to save report.');
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id || authorProfile.id;

    const insertPayload = {
      user_id: currentUserId,
      title: itemData.title.trim(),
      description: itemData.description.trim(),
      report_type: itemData.type || itemData.report_type || 'lost',
      category: itemData.category,
      location: itemData.location_name || itemData.location || 'Campus',
      location_building:
        itemData.location_building ||
        (itemData.location_name
          ? itemData.location_name.split(',')[0]
          : 'Campus'),
      campus_zone: itemData.campus_zone || 'Central Campus',
      incident_date:
        itemData.date_lost_or_found ||
        itemData.incident_date ||
        new Date().toISOString(),
      status: 'open',
      image_url: itemData.primary_image_url || itemData.image_url || null,
      contact_preference: itemData.contact_preference || 'in_app',
      custody_location: itemData.custody_location || null,
      confidential_notes: itemData.confidential_notes?.trim() || null,
    };

    const { data, error } = await supabase
      .from('reports')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Report submission failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('Report submission failed: no report data was returned.');
    }

    const createdItem = mapReportRowToItem(data, authorProfile);

    // Add the initial timeline event.
    try {
      const { error: timelineError } = await supabase
        .from('case_timeline_events')
        .insert({
          report_id: createdItem.id,
          actor_id: currentUserId,
          event_type: 'reported',
          title:
            createdItem.report_type === 'lost'
              ? 'Lost Report Logged'
              : 'Found Report Logged',
          description: `${authorProfile.full_name} (${authorProfile.role}) logged "${createdItem.title}" at ${createdItem.location}.`,
        });

      if (timelineError) {
        console.warn('Could not insert timeline event:', timelineError);
      }
    } catch (timelineErr) {
      console.warn('Could not insert timeline event:', timelineErr);
    }

    // Find potential matches against existing active reports.
    try {
      const {
        data: allActiveReports,
        error: activeReportsError,
      } = await supabase
        .from('reports')
        .select('*')
        .neq('id', createdItem.id)
        .in('status', ['open', 'potential_match']);

      if (activeReportsError) {
        console.warn(
          'Could not retrieve reports for smart matching:',
          activeReportsError
        );
      } else {
        const activeReports = allActiveReports ?? [];

        if (activeReports.length > 0) {
          const mappedExisting = activeReports.map((report) =>
            mapReportRowToItem(report)
          );

          const matches = findMatchesForItem(
            createdItem,
            mappedExisting,
            65
          );

          if (matches.length > 0) {
            const topMatch = matches[0];
            const matchedItem =
              createdItem.type === 'lost'
                ? topMatch.found_item
                : topMatch.lost_item;

            // Update both reports to potential_match.
            const { error: newReportUpdateError } = await supabase
              .from('reports')
              .update({ status: 'potential_match' })
              .eq('id', createdItem.id);

            if (newReportUpdateError) {
              console.warn(
                'Could not update new report status:',
                newReportUpdateError
              );
            }

            const { error: matchedReportUpdateError } = await supabase
              .from('reports')
              .update({ status: 'potential_match' })
              .eq('id', matchedItem.id);

            if (matchedReportUpdateError) {
              console.warn(
                'Could not update matched report status:',
                matchedReportUpdateError
              );
            }

            // Add a match timeline event.
            const { error: matchTimelineError } = await supabase
              .from('case_timeline_events')
              .insert({
                report_id: createdItem.id,
                actor_id: currentUserId,
                event_type: 'match_detected',
                title: `Smart Match Detected (${topMatch.score}%)`,
                description: `Potential candidate pair: "${matchedItem.title}" reported at ${matchedItem.location}.`,
              });

            if (matchTimelineError) {
              console.warn(
                'Could not insert match timeline event:',
                matchTimelineError
              );
            }

            // Notify the owner of the other report.
            const { error: notificationError } = await supabase
              .from('notifications')
              .insert({
                user_id: matchedItem.user_id,
                title: `Potential Match Detected (${topMatch.score}%)`,
                message: `A new report matching your item "${matchedItem.title}" was registered: "${createdItem.title}".`,
                type: 'match_found',
                related_report_id: createdItem.id,
                link_url: `/items/${createdItem.id}`,
                is_read: false,
              });

            if (notificationError) {
              console.warn(
                'Could not create match notification:',
                notificationError
              );
            }
          }
        }
      }
    } catch (matchErr) {
      console.warn('Smart matching evaluation error:', matchErr);
    }

    return createdItem;
  },


  // Delete a report (only allowed for owner when open, or admin)
  deleteItem: async (itemId: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw new Error(`Failed to delete report: ${error.message}`);
    }

    return true;
  },

  // Update item status
  
  updateItemStatus: async (
    itemId: string,
    status: Item['status']
  ): Promise<Item | null> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', itemId)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to update report status: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return mapReportRowToItem(data);
  },


  // Submit an Ownership Claim with private evidence
  submitClaim: async (
    reportId: string,
    claimant: Profile,
    ownershipProof: string,
    proofImageUrl?: string
  ): Promise<Claim> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const claimantId = sessionData?.session?.user?.id || claimant.id;

    // Check if target report exists
    const targetReport = await itemsService.getItemById(reportId);
    if (!targetReport) {
      throw new Error('Target report not found.');
    }

    if (targetReport.user_id === claimantId) {
      throw new Error('You cannot claim an item you reported yourself.');
    }

    // Insert claim record into Supabase
    const { data, error } = await supabase
      .from('claims')
      .insert({
        report_id: reportId,
        claimant_id: claimantId,
        message: ownershipProof.trim(),
        status: 'submitted',
      })
      .select(`
        *,
        claimant:claimant_id (
          id,
          full_name,
          role,
          email
        )
      `)
      .single();

    if (error || !data) {
      throw new Error(`Claim submission failed: ${error?.message || 'Database error'}`);
    }

    const newClaim: Claim = {
      id: data.id,
      report_id: data.report_id,
      item_id: data.report_id,
      claimant_id: data.claimant_id,
      message: data.message,
      ownership_proof: data.message,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      item: targetReport,
      report: targetReport,
      claimant,
    };

    // Update target report status to 'claimed' or 'claim_pending'
    await supabase.from('reports').update({ status: 'claim_pending' }).eq('id', reportId);

    // Insert timeline event
    try {
      await supabase.from('case_timeline_events').insert({
        report_id: reportId,
        claim_id: newClaim.id,
        actor_id: claimantId,
        event_type: 'claim_submitted',
        title: 'Ownership Claim Submitted',
        description: `${claimant.full_name} submitted private verification proof for review.`,
      });
    } catch (tErr) {
      console.warn('Failed to insert claim timeline event:', tErr);
    }

    // Notify the report author
    try {
      await supabase.from('notifications').insert({
        user_id: targetReport.user_id,
        title: 'New Ownership Claim Submitted',
        message: `${claimant.full_name} submitted an ownership claim on your reported item "${targetReport.title}".`,
        type: 'claim_update',
        related_report_id: reportId,
        link_url: `/claims/${newClaim.id}`,
        is_read: false,
      });
    } catch (nErr) {
      console.warn('Failed to insert claim notification:', nErr);
    }

    return newClaim;
  },

  // Review a claim (Approve or Reject by Officer or Admin)
  reviewClaim: async (
    claimId: string,
    reviewer: Profile,
    approved: boolean,
    notes: string,
    handoverLocation = 'Campus Security Office - Custodial Desk 1'
  ): Promise<Claim | null> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const handoverCode = approved ? `REUN-${randomSuffix}-${reviewer.role === 'campus_security' ? 'SEC' : 'DESK'}` : null;
    const scheduledFor = approved ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null;

    const { data: updatedClaim, error } = await supabase
      .from('claims')
      .update({
        status: approved ? 'approved' : 'rejected',
        reviewer_id: reviewer.id,
        reviewer_notes: notes.trim(),
        reviewed_at: new Date().toISOString(),
        handover_code: handoverCode,
        handover_location: approved ? handoverLocation : null,
        handover_scheduled_for: scheduledFor,
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId)
      .select(`
        *,
        claimant:claimant_id (
          id,
          full_name,
          role,
          email
        )
      `)
      .single();

    if (error || !updatedClaim) {
      throw new Error(`Review action failed: ${error?.message || 'Database update error'}`);
    }

    // If approved, update report status
    if (approved) {
      await supabase.from('reports').update({ status: 'handover_scheduled' }).eq('id', updatedClaim.report_id);
    }

    // Add Timeline Event
    try {
      await supabase.from('case_timeline_events').insert({
        report_id: updatedClaim.report_id,
        claim_id: claimId,
        actor_id: reviewer.id,
        event_type: approved ? 'approved' : 'rejected',
        title: approved ? 'Claim Approved — Handover Ready' : 'Claim Rejected by Reviewer',
        description: `${reviewer.full_name} (${reviewer.role}) ${approved ? 'verified ownership proof' : 'declined the claim'}. Notes: ${notes}`,
      });
    } catch (tErr) {
      console.warn('Could not record review timeline event:', tErr);
    }

    // Notify claimant
    try {
      await supabase.from('notifications').insert({
        user_id: updatedClaim.claimant_id,
        title: approved ? 'Claim Approved! Handover Ready' : 'Claim Verification Update',
        message: approved
          ? `Your claim was approved! Access your secure QR Handover Pass to collect your item at ${handoverLocation}.`
          : `Your claim was not approved: "${notes}". Contact Campus Security for assistance.`,
        type: 'claim_update',
        related_report_id: updatedClaim.report_id,
        link_url: `/claims/${claimId}`,
        is_read: false,
      });
    } catch (nErr) {
      console.warn('Could not send review notification:', nErr);
    }

    return itemsService.getClaimById(claimId);
  },

  // Complete Handover (explicit in-person collection confirmation)
  completeHandover: async (claimId: string, officerName: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.');
    }

    const { data: claim, error: fetchErr } = await supabase
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .single();

    if (fetchErr || !claim) {
      throw new Error('Claim not found.');
    }

    const now = new Date().toISOString();

    const { error: claimErr } = await supabase
      .from('claims')
      .update({
        status: 'returned',
        handover_completed_at: now,
        updated_at: now,
      })
      .eq('id', claimId);

    if (claimErr) {
      throw new Error(`Could not update claim status: ${claimErr.message}`);
    }

    // Update report status to returned
    await supabase.from('reports').update({ status: 'returned', updated_at: now }).eq('id', claim.report_id);

    // Record timeline event
    try {
      await supabase.from('case_timeline_events').insert({
        report_id: claim.report_id,
        claim_id: claimId,
        event_type: 'returned',
        title: 'Item Successfully Reunified!',
        description: `In-person verification and handover completed with officer ${officerName}.`,
      });
    } catch (tErr) {
      console.warn('Timeline event insert failed:', tErr);
    }

    // Notify claimant
    try {
      await supabase.from('notifications').insert({
        user_id: claim.claimant_id,
        title: 'Item Return Confirmed',
        message: 'Your item has been marked returned. Thank you for using Reunify!',
        type: 'item_returned',
        related_report_id: claim.report_id,
        link_url: `/cases/${claim.report_id}`,
        is_read: false,
      });
    } catch (nErr) {
      console.warn('Return notification failed:', nErr);
    }

    return true;
  },

  // Get Claims for a specific report or claimant
  getClaims: async (filter?: { itemId?: string; claimantId?: string }): Promise<Claim[]> => {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      let query = supabase
        .from('claims')
        .select(`
          *,
          reports:report_id (*),
          claimant:claimant_id (
            id,
            full_name,
            role,
            email
          ),
          reviewer:reviewer_id (
            id,
            full_name,
            role,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (filter?.itemId) {
        query = query.eq('report_id', filter.itemId);
      }
      if (filter?.claimantId) {
        query = query.eq('claimant_id', filter.claimantId);
      }

      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((c) => ({
        id: c.id,
        report_id: c.report_id,
        item_id: c.report_id,
        claimant_id: c.claimant_id,
        message: c.message,
        ownership_proof: c.message,
        status: c.status,
        reviewer_id: c.reviewer_id,
        reviewer_notes: c.reviewer_notes,
        reviewed_at: c.reviewed_at,
        handover_code: c.handover_code,
        handover_location: c.handover_location,
        handover_scheduled_for: c.handover_scheduled_for,
        handover_completed_at: c.handover_completed_at,
        created_at: c.created_at,
        updated_at: c.updated_at,
        item: c.reports ? mapReportRowToItem(c.reports) : undefined,
        report: c.reports ? mapReportRowToItem(c.reports) : undefined,
        claimant: c.claimant,
        reviewer: c.reviewer,
      }));
    } catch (err) {
      console.error('Error fetching claims:', err);
      return [];
    }
  },

  // Get single claim by ID
  getClaimById: async (claimId: string): Promise<Claim | null> => {
    if (!isSupabaseConfigured() || !claimId) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          reports:report_id (*),
          claimant:claimant_id (
            id,
            full_name,
            role,
            email
          ),
          reviewer:reviewer_id (
            id,
            full_name,
            role,
            email
          )
        `)
        .eq('id', claimId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        report_id: data.report_id,
        item_id: data.report_id,
        claimant_id: data.claimant_id,
        message: data.message,
        ownership_proof: data.message,
        status: data.status,
        reviewer_id: data.reviewer_id,
        reviewer_notes: data.reviewer_notes,
        reviewed_at: data.reviewed_at,
        handover_code: data.handover_code,
        handover_location: data.handover_location,
        handover_scheduled_for: data.handover_scheduled_for,
        handover_completed_at: data.handover_completed_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        item: data.reports ? mapReportRowToItem(data.reports) : undefined,
        report: data.reports ? mapReportRowToItem(data.reports) : undefined,
        claimant: data.claimant,
        reviewer: data.reviewer,
      };
    } catch (err) {
      console.error('Error fetching claim by id:', err);
      return null;
    }
  },

  // Timeline events for a report
  getTimelineForItem: async (itemId: string): Promise<CaseTimelineEvent[]> => {
    if (!isSupabaseConfigured() || !itemId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('case_timeline_events')
        .select('*')
        .eq('report_id', itemId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((e) => ({
        id: e.id,
        report_id: e.report_id,
        item_id: e.report_id,
        claim_id: e.claim_id,
        actor_id: e.actor_id,
        event_type: e.event_type,
        title: e.title,
        description: e.description,
        created_at: e.created_at,
      }));
    } catch (err) {
      console.error('Error fetching timeline events:', err);
      return [];
    }
  },

  // Get notifications for a user
  getNotifications: async (userId: string): Promise<InAppNotification[]> => {
    if (!isSupabaseConfigured() || !userId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      return [];
    }
  },

  // Mark single notification read
  markNotificationRead: async (notifId: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notifId);
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  },

  // Mark all notifications read
  markAllNotificationsRead: async (userId: string): Promise<void> => {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', false);
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  },
};
