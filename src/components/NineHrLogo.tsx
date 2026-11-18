import React from 'react';

interface NineHrLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark' | 'white';
  showSubtitle?: boolean;
}

export const NineHrLogo: React.FC<NineHrLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = true,
}) => {
  // Dimensions
  const dimensions = {
    sm: { icon: 32, text: 'text-lg', sub: 'text-[9px]' },
    md: { icon: 42, text: 'text-2xl', sub: 'text-[11px]' },
    lg: { icon: 54, text: 'text-3xl', sub: 'text-xs' },
    xl: { icon: 68, text: 'text-4xl', sub: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 9HR Emblem Badge */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center rounded-2xl shadow-sm overflow-hidden"
        style={{
          width: dimensions.icon,
          height: dimensions.icon,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          border: '1.5px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle geometric background grid line */}
          <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="3 3" />
          
          {/* Blue dynamic swoosh */}
          <path
            d="M20 70C28 82 45 88 62 82C75 77 84 66 84 50C84 32 70 18 52 18C34 18 20 32 20 50C20 62 26 72 35 78"
            stroke="url(#blueGrad)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Stylized Number 9 / HR Monogram */}
          <circle cx="43" cy="40" r="15" stroke="#ffffff" strokeWidth="6" />
          <path
            d="M58 40V68C58 74 53 78 47 78C42 78 38 75 36 71"
            stroke="#ffffff"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Emerald Green Growth Checkmark / Leaf */}
          <path
            d="M54 52L64 62L82 42"
            stroke="#10b981"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Subtle Warm Yellow Accent Spark */}
          <circle cx="78" cy="26" r="3.5" fill="#facc15" />
          <path d="M78 20V23M78 29V32M72 26H75M81 26H84" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" />

          {/* Gradients */}
          <defs>
            <linearGradient id="blueGrad" x1="20" y1="20" x2="84" y2="84" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b82f6" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      {variant !== 'mark' && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-tight leading-none">
            <span
              className={`font-black tracking-tight ${dimensions.text} ${
                variant === 'white' ? 'text-white' : 'text-slate-900'
              }`}
            >
              9HR
            </span>
            <span className={`font-extrabold tracking-tight ml-1.5 text-emerald-600 ${dimensions.text}`}>
              INDIA
            </span>
          </div>
          {showSubtitle && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`font-semibold tracking-wider uppercase ${dimensions.sub} ${
                  variant === 'white' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Pvt. Ltd.
              </span>
              <span className="w-1 h-1 rounded-full bg-amber-400"></span>
              <span
                className={`font-medium tracking-tight ${dimensions.sub} ${
                  variant === 'white' ? 'text-blue-200' : 'text-blue-600'
                }`}
              >
                HR Onboarding Portal
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
