import React from 'react';

interface AvatarProps {
  photoUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  photoUrl,
  name,
  size = 'md',
  className = '',
}) => {
  // Compute initials (up to 2 letters)
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl',
    xl: 'w-32 h-32 text-4xl',
  }[size];

  if (photoUrl) {
    return (
      <div
        className={`relative overflow-hidden rounded-full shrink-0 ${sizeClasses} ${className}`}
        style={{
          boxShadow: '4px 4px 8px var(--clay-shadow-dark), -4px -4px 8px var(--clay-shadow-light)',
          backgroundColor: 'var(--clay-surface)',
        }}
      >
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // If image fails to load, gracefully hide it to show initials background
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Soft clay initials placeholder
  return (
    <div
      className={`flex items-center justify-center font-bold select-none rounded-full shrink-0 ${sizeClasses} ${className}`}
      style={{
        backgroundColor: '#EBD8C3',
        color: 'var(--clay-primary)',
        boxShadow: 'inset 3px 3px 6px var(--clay-shadow-dark), inset -3px -3px 6px var(--clay-shadow-light)',
      }}
      aria-label={`Avatar initials for ${name}`}
    >
      <span>{initials}</span>
    </div>
  );
};

export default Avatar;
