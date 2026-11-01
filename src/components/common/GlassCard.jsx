import React from 'react';

export default function GlassCard({
  children,
  className = '',
  hoverEffect = true,
  sheen = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl relative overflow-hidden transition-all duration-300 ${
        hoverEffect ? 'hover:border-cyan-500/40 hover:shadow-glass-glow' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {/* Subtle holographic sheen layer */}
      {sheen && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 holographic-sheen opacity-60"
        />
      )}

      {/* Card Content */}
      <div className="relative z-10 p-5 md:p-6">
        {children}
      </div>
    </div>
  );
}
