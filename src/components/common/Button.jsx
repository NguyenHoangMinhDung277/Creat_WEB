import React from 'react';
import RainbowBorder from './RainbowBorder';

export default function Button({
  children,
  variant = 'neon', // 'neon' | 'rainbow' | 'glass' | 'ghost' | 'danger'
  size = 'md',     // 'sm' | 'md' | 'lg'
  onClick,
  disabled = false,
  className = '',
  icon: Icon = null,
  type = 'button',
  ariaLabel,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
    md: 'px-4 py-2.5 text-sm font-semibold rounded-xl',
    lg: 'px-6 py-3.5 text-base font-bold rounded-2xl',
  };

  if (variant === 'rainbow') {
    return (
      <RainbowBorder
        as="button"
        type={type}
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel}
        className={`focus:outline-none focus:ring-2 focus:ring-holo-cyan focus:ring-offset-2 focus:ring-offset-ocean-950 transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
        } ${className}`}
        innerClassName={`flex items-center justify-center gap-2 ${sizeClasses[size]}`}
        glow={!disabled}
        {...props}
      >
        {Icon && <Icon className="w-4 h-4 shrink-0" />}
        <span>{children}</span>
      </RainbowBorder>
    );
  }

  const variantClasses = {
    neon: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-neon-cyan hover:shadow-glass-glow',
    glass: 'glass-panel text-slate-100 hover:border-cyan-400/50 hover:bg-ocean-800/60 active:bg-ocean-850',
    ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5 active:bg-white/10',
    danger: 'bg-rose-600/80 hover:bg-rose-500 text-white shadow-md active:bg-rose-700',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-holo-cyan focus:ring-offset-2 focus:ring-offset-ocean-950 ${
        variantClasses[variant] || variantClasses.neon
      } ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 cursor-pointer'
      } ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
}
