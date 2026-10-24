import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'white';
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'dark',
  showTagline = false,
  size = 'md',
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', dot: 'w-1.5 h-1.5' },
    md: { icon: 34, text: 'text-xl', dot: 'w-2 h-2' },
    lg: { icon: 42, text: 'text-2xl', dot: 'w-2.5 h-2.5' },
  };

  const { icon, text } = sizeMap[size];

  const textColor = 
    variant === 'white' 
      ? 'text-white' 
      : variant === 'light' 
      ? 'text-slate-100' 
      : 'text-slate-900';

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Dynamic Brand Glyph */}
      <div className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="reunifyGradient" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>
            <filter id="reunifyGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Rounded base */}
          <rect width="48" height="48" rx="13" fill="#0B1120" />
          <rect x="1" y="1" width="46" height="46" rx="12" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />

          {/* Interlocking loop */}
          <path
            d="M14 24C14 18.4772 18.4772 14 24 14C27.5 14 30.5 15.8 32.2 18.5L28.8 20.8C27.6 19 25.9 18 24 18C20.6863 18 18 20.6863 18 24C18 27.3137 20.6863 30 24 30C26.5 30 28.5 28.5 29.5 26.2H23.5V22.2H34V25C33 30.5 28.8 34 24 34C18.4772 34 14 29.5228 14 24Z"
            fill="url(#reunifyGradient)"
          />

          {/* Recovery beacon spark */}
          <circle cx="34" cy="14" r="3.5" fill="#38BDF8" filter="url(#reunifyGlow)" />
          <circle cx="34" cy="14" r="1.8" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col">
        <div className={`font-extrabold tracking-tight ${text} ${textColor} flex items-center leading-none`}>
          <span>REUN</span>
          <span className="text-brand-cyan">I</span>
          <span>FY</span>
        </div>
        {showTagline && (
          <span className="text-[10px] tracking-wider uppercase font-medium text-slate-400 mt-0.5">
            Lost & Found
          </span>
        )}
      </div>
    </Link>
  );
};
