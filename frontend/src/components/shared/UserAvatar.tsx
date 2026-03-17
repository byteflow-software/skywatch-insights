import React, { useState } from 'react';

const AVATAR_COLORS = [
  'bg-[#0EA5E9]',
  'bg-[#6366F1]',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'h-6 w-6 text-[9px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-12 w-12 text-sm',
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 'sm',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const sizeClass = SIZES[size];
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClass} shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${bgColor} flex shrink-0 items-center justify-center rounded-full font-bold text-white ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};

export default UserAvatar;
