import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  X, 
  RotateCcw, 
  SlidersHorizontal, 
  Sparkles, 
  MapPin, 
  Tag,
  PlusCircle,
  Inbox
} from 'lucide-react';
import { useItems } from '../context/ItemsContext';
import { ItemCard } from '../components/common/ItemCard';
import { CardGridSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';

export const ExplorePage: React.FC = () => {
  const { items, isLoading, refreshData } = useItems();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state synced with URL search params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState<string>(searchParams.get('type') || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('cat') || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'all');
  const [selectedLocation, setSelectedLocation] = useState<string>(searchParams.get('loc') || '');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sort') || 'newest');

  // Synchronize state with URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedType !== 'all') params.type = selectedType;
    if (selectedCategory !== 'all') params.cat = selectedCategory;
    if (selectedStatus !== 'all') params.status = selectedStatus;
    if (selectedLocation) params.loc = selectedLocation;
    if (sortBy !== 'newest') params.sort = sortBy;

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedType, selectedCategory, selectedStatus, selectedLocation, sortBy, setSearchParams]);

  // Categories list
  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Categories' },
    { key: 'electronics', label: 'Electronics & Audio' },
    { key: 'keys', label: 'Keys & Keycards' },
    { key: 'wallets_cards', label: 'Wallets & Cards' },
    { key: 'id_cards', label: 'Student / Campus IDs' },
    { key: 'eyewear', label: 'Eyewear & Sunglasses' },
    { key: 'clothing', label: 'Jackets & Clothing' },
    { key: 'bags', label: 'Backpacks & Bags' },
    { key: 'books_notes', label: 'Books & Notebooks' },
    { key: 'other', label: 'Water Bottles & Other' },
  ];

  // Filtered & Sorted items derived from real database
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location_name?.toLowerCase().includes(q) ||
          i.location?.toLowerCase().includes(q) ||
          (i.location_building && i.location_building.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter((i) => i.report_type === selectedType || i.type === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((i) => i.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((i) => i.status === selectedStatus);
    }

    // Location filter
    if (selectedLocation.trim()) {
      const loc = selectedLocation.toLowerCase().trim();
      result = result.filter(
        (i) =>
          (i.location_name && i.location_name.toLowerCase().includes(loc)) ||
          (i.location && i.location.toLowerCase().includes(loc)) ||
          (i.location_building && i.location_building.toLowerCase().includes(loc)) ||
          (i.campus_zone && i.campus_zone.toLowerCase().includes(loc))
      );
    }

    // Sorting
    if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.incident_date || a.date_lost_or_found || a.created_at).getTime() - new Date(b.incident_date || b.date_lost_or_found || b.created_at).getTime());
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // newest
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [items, searchQuery, selectedType, selectedCategory, selectedStatus, selectedLocation, sortBy]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedLocation('');
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedStatus !== 'all' ||
    selectedLocation ||
    sortBy !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Campus Repository
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 mt-1">
            Explore Campus Belongings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search verified lost and found records across campus departments and dormitories.
          </p>
        </div>

        {/* Real Count & Actions */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs tabular-nums font-mono">
            {filteredItems.length} {filteredItems.length === 1 ? 'Report' : 'Reports'}
          </span>
          <Link
            to="/report/lost"
            className="px-3.5 py-1.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>Report Item</span>
          </Link>
        </div>
      </div>

      {/* Search Bar & Primary Toggles */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-card border border-slate-200/90 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Text Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search keyword (e.g., AirPods, water bottle, navy scarf, keys)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 outline-none text-slate-800 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Lost / Found Type Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedType === 'all'
                  ? 'bg-white text-navy-950 shadow-xs'
                  : 'text-slate-600 hover:text-navy-950'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setSelectedType('lost')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedType === 'lost'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy-950'
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => setSelectedType('found')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedType === 'found'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy-950'
              }`}
            >
              Found Only
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none focus:ring-2 focus:ring-teal-600"
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Building or Campus Zone
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Library, Science, Commons..."
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none focus:ring-2 focus:ring-teal-600"
              />
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Report Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open / Active</option>
              <option value="potential_match">Match Detected</option>
              <option value="claim_pending">Claim In Review</option>
              <option value="handover_scheduled">Handover Scheduled</option>
              <option value="returned">Reunified & Returned</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest Date</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Active Filters:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-slate-100 text-slate-700">
                Keyword: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-slate-100 text-slate-700 capitalize">
                Type: {selectedType}
                <button onClick={() => setSelectedType('all')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-slate-100 text-slate-700">
                Category: {selectedCategory.replace('_', ' ')}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedLocation && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-slate-100 text-slate-700">
                Location: {selectedLocation}
                <button onClick={() => setSelectedLocation('')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-slate-100 text-slate-700">
                Status: {selectedStatus}
                <button onClick={() => setSelectedStatus('all')} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 ml-2 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid Results */}
      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : items.length === 0 && !hasActiveFilters ? (
        /* Fresh Empty Database State */
        <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200/90 shadow-card max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-4 border border-teal-100">
            <Inbox className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-navy-950">No Campus Reports Yet</h2>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            The lost and found repository is currently clear. If you have misplaced something or discovered an unattended item on campus, log a report below.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/report/lost"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white font-bold text-xs shadow-soft transition-all"
            >
              Report Lost Belonging
            </Link>
            <Link
              to="/report/found"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-soft transition-all"
            >
              Log Found Belonging
            </Link>
          </div>
        </div>
      ) : (
        /* Filter Empty State */
        <EmptyState
          icon="search"
          title="No Belongings Match Your Search"
          description="Try broadening your search query, clearing specific location filters, or reset active filters."
          actionLabel="Clear Filters"
          onActionClick={clearAllFilters}
        />
      )}
    </div>
  );
};
