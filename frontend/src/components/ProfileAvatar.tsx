import React, { useState } from 'react';

interface ProfileAvatarProps {

  name?: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  photo?: string | null;
  alt?: string;
}

const FALLBACK_BRAND_PALETTE = [
  // Blue
  { bg: '#2563eb', fg: '#1e3a8a' },
  // Green
  { bg: '#10b981', fg: '#065f46' },
  // Orange
  { bg: '#f59e0b', fg: '#7c2d12' }
];

const FALLBACK_BRAND_CLASSES = [
  'avatar-fallback-blue',
  'avatar-fallback-green',
  'avatar-fallback-orange',
];

export default function ProfileAvatar({
  name = 'User',
  role,
  size = 'md',
  className = '',
  photo,
  alt
}: ProfileAvatarProps) {

  // Keep strict 1:1 aspect ratio for perfect circles.
  // Standardize sizes so small avatars (used on dashboard) are consistent.
  const sizeClasses =
    size === 'sm'
      ? 'w-7 h-7 text-sm'
      : size === 'lg'
        ? 'w-16 h-16 text-xl'
        : 'w-12 h-12 text-md';


  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  const [imgError, setImgError] = useState(false);

  const idx = (name?.length ?? 0) % FALLBACK_BRAND_PALETTE.length;
  const palette = FALLBACK_BRAND_PALETTE[idx];
  const paletteClass = FALLBACK_BRAND_CLASSES[idx];

  // Crisp, no filters: avoid jagged edges by using a solid border mask.
  const crispBorderMaskClass = `absolute inset-0 rounded-full border-2 border-[#ffffff] pointer-events-none`;




  const shouldShowPhoto = Boolean(photo) && !imgError;

  // White border mask so overlapped avatars don't bleed together.
  const baseClass = `relative shrink-0 ${sizeClasses} ${className}`;



  if (shouldShowPhoto) {
    return (
      <div className={baseClass} aria-label={alt || name}>
        <img
          src={photo || undefined}
          alt={alt || name}
          className="object-cover w-full h-full block rounded-full"
          onError={() => setImgError(true)}
        />
        <span className={crispBorderMaskClass} />
      </div>

    );
  }

  return (
    <div
      className={`${baseClass} ${paletteClass}`}
    >
      <span className={crispBorderMaskClass} />
      <span className="relative flex items-center justify-center w-full h-full font-medium">
        {initial}
      </span>
    </div>
  );

}



