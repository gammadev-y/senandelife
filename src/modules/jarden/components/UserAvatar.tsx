

import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: 'sm' | 'md' | 'lg'; // sm: 24px, md: 32px, lg: 40px
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ avatarUrl, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6', // 24px
    md: 'w-8 h-8', // 32px
    lg: 'w-10 h-10', // 40px
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="User avatar"
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div className={`rounded-full flex items-center justify-center bg-[#E5E3DD] ${sizeClasses[size]} ${className}`}>
        <UserCircleIcon
        className={`text-[#B6B6B6] w-[90%] h-[90%]`}
        />
    </div>
  );
};

export default UserAvatar;
