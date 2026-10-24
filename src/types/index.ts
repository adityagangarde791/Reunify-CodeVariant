// REUNIFY PRODUCTION TYPE DEFINITIONS

export type UserRole = 'student' | 'faculty_staff' | 'campus_security' | 'admin';

export type ReportType = 'lost' | 'found';
export type ItemType = ReportType; // Backwards compatible alias

export type ItemCategory = 
  | 'electronics'
  | 'keys'
  | 'wallets_cards'
  | 'clothing'
  | 'books_notes'
  | 'eyewear'
  | 'jewelry'
  | 'bags'
  | 'id_cards'
  | 'sports'
  | 'other';

export type ReportStatus = 
  | 'open'
  | 'claimed'
  | 'resolved'
  | 'closed';

// Extended status for detailed campus recovery workflow
export type ItemStatus = 
  | 'active'
  | 'open'
  | 'potential_match'
  | 'claim_pending'
  | 'claimed'
  | 'handover_scheduled'
  | 'resolved'
  | 'returned'
  | 'closed'
  | 'cancelled';

export type ClaimStatus = 
  | 'pending'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'withdrawn'
  | 'handover_pending'
  | 'returned'
  | 'cancelled';

export type CaseEventType = 
  | 'reported'
  | 'match_detected'
  | 'claim_submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'handover_scheduled'
  | 'resolved'
  | 'returned'
  | 'closed';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  department?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  description: string;
  report_type?: ReportType;
  type?: ReportType; // UI alias
  category: ItemCategory;
  location?: string;
  location_name?: string; // UI alias
  incident_date?: string;
  date_lost_or_found?: string; // UI alias
  status: ItemStatus;
  image_url?: string;
  primary_image_url?: string; // UI alias
  contact_preference?: 'in_app' | 'email' | 'phone';
  // Campus recovery additions
  location_building?: string;
  campus_zone?: string;
  custody_location?: string;
  confidential_notes?: string;
  created_at: string;
  updated_at: string;
  // Expanded metadata
  author_name?: string;
  author_role?: UserRole;
}

// Item is an alias to Report for seamless compatibility
export type Item = Report;

export interface Claim {
  id: string;
  report_id: string;
  claimant_id: string;
  message: string; // ownership proof description
  status: ClaimStatus;
  reviewer_id?: string;
  reviewer_notes?: string;
  reviewed_at?: string;
  handover_code?: string;
  handover_location?: string;
  handover_scheduled_for?: string;
  handover_completed_at?: string;
  created_at: string;
  updated_at: string;
  // Aliases for compatibility
  item_id?: string;
  ownership_proof?: string;
  // Expanded fields
  item?: Report;
  report?: Report;
  claimant?: Profile;
  reviewer?: Profile;
}

export interface MatchScoreReason {
  criterion: 'category' | 'title_tokens' | 'location' | 'temporal' | 'description';
  points: number;
  max: number;
  detail: string;
}

export interface MatchCandidate {
  id: string;
  lost_item: Report;
  found_item: Report;
  score: number; // 0 - 100
  reasons: MatchScoreReason[];
  status: 'suggested' | 'dismissed' | 'claimed';
  created_at: string;
}

export interface CaseTimelineEvent {
  id: string;
  report_id: string;
  item_id?: string;
  claim_id?: string;
  actor_id?: string;
  event_type: CaseEventType;
  title: string;
  description: string;
  created_at: string;
  actor_name?: string;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'match_found' | 'claim_update' | 'handover_ready' | 'item_returned' | 'system';
  related_report_id?: string;
  link_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface FilterState {
  searchQuery: string;
  type: 'all' | 'lost' | 'found';
  category: 'all' | ItemCategory;
  location: string;
  status: 'all' | ItemStatus;
  sortBy: 'newest' | 'oldest' | 'title';
  dateFrom?: string;
  dateTo?: string;
}
