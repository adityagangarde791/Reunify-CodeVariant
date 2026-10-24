import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Item } from '../../types';
import { TypeBadge, StatusBadge } from './Badge';

interface ItemCardProps {
  item: Item;
  matchScore?: number;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, matchScore }) => {
  const [imageError, setImageError] = useState(false);

  const itemType = item.report_type || item.type || 'lost';

  // Default placeholder if image is missing or fails to load
  const fallbackImage =
    itemType === 'lost'
      ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80'
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  const rawDate = item.date_lost_or_found || item.incident_date || item.created_at;
  const formattedDate = new Date(rawDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const displayImage = !imageError && (item.primary_image_url || item.image_url) 
    ? (item.primary_image_url || item.image_url)! 
    : fallbackImage;

  const locationDisplay = item.location_name || item.location || 'Campus';

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col overflow-hidden group"
    >
      {/* Media Aspect Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={displayImage}
          alt={item.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <TypeBadge type={itemType} size="sm" />
          {matchScore !== undefined ? (
            <span className="inline-flex items-center gap-1 bg-navy-950/90 text-teal-300 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              {matchScore}% Match
            </span>
          ) : (
            <StatusBadge status={item.status} size="sm" />
          )}
        </div>

        {/* Custody Indicator for found items */}
        {itemType === 'found' && item.custody_location && (
          <div className="absolute bottom-2 left-2 right-2 bg-navy-950/85 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-md flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
            <span className="truncate">Held at: {item.custody_location}</span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Chip */}
          <span className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">
            {item.category.replace('_', ' ')}
          </span>

          {/* Title */}
          <h3 className="text-base font-bold text-navy-950 group-hover:text-teal-700 transition-colors line-clamp-1 mt-1">
            {item.title}
          </h3>

          {/* Public Description */}
          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Meta Details */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center text-xs text-slate-500 truncate gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{locationDisplay}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>

            <Link
              to={`/items/${item.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
