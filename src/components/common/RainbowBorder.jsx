import React from 'react';

/**
 * RainbowBorder Component
 * Provides a continuously moving 7-color rainbow neon glowing border.
 * Features:
 * - Hardware-accelerated CSS conic & linear animated gradients.
 * - Respects prefers-reduced-motion via CSS media queries.
 * - Supports arbitrary inner children and custom border radii.
 * - Optional ambient glow layer.
 */
export default function RainbowBorder({
  children,
  className = '',
  innerClassName = '',
  rounded = 'rounded-2xl',
  glow = true,
  thickness = 2,
  interactive = false,
  as: Component = 'div',
  onClick,
  ...props
}) {
  const padClass = thickness === 1 ? 'p-[1px]' : thickness === 3 ? 'p-[3px]' : 'p-[2px]';

  return (
    <Component
      onClick={onClick}
      className={`relative group inline-block w-full ${interactive ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {/* Ambient glowing aura beneath */}
      {glow && (
        <div
          aria-hidden="true"
          className={`absolute -inset-[2px] ${rounded} rainbow-gradient-bar opacity-40 group-hover:opacity-75 blur-md transition-opacity duration-500`}
        />
      )}

      {/* Animated gradient border container */}
      <div
        className={`relative ${padClass} ${rounded} overflow-hidden rainbow-gradient-bar transition-all duration-300`}
      >
        {/* Inner container to hold card / button / navbar content */}
        <div
          className={`relative w-full h-full ${rounded} bg-ocean-950/85 dark:bg-ocean-950/90 light:bg-white/95 backdrop-blur-md transition-colors duration-200 ${innerClassName}`}
        >
          {children}
        </div>
      </div>
    </Component>
  );
}
