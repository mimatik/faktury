import React from 'react';

interface AvatarProps {
    name: string;
    id?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, id, size = 'md', className = '' }) => {
    const getInitials = (name: string) => {
        const parts = name.trim().split(/[\s@.]+/); // Split by space, @, or .
        if (parts.length === 0) return '';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const getColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Generate HSL color
        // Hue: 0-360 based on hash
        // Saturation: 65-75% for vibrancy
        // Lightness: 45-55% for good contrast with white text
        const h = Math.abs(hash) % 360;
        const s = 55;
        const l = 60;
        return `hsl(${h}, ${s}%, ${l}%)`;
    };

    const baseClasses = 'rounded-full flex items-center justify-center shrink-0 text-white font-[600] shadow-sm';

    const sizeClasses = {
        sm: 'w-7 h-7 text-xs',
        md: 'w-8 h-8 text-sm',
        lg: 'w-10 h-10 text-base'
    };

    const bgColor = getColor(id || name);
    const initials = getInitials(name);

    return (
        <div
            className={`${baseClasses} ${sizeClasses[size]} ${className}`}
            style={{ backgroundColor: bgColor }}
            title={name}
        >
            {initials}
        </div>
    );
};
