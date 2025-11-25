import React, { ButtonHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: LucideIcon;
    variant?: 'default' | 'primary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
    icon: Icon,
    variant = 'default',
    size = 'md',
    tooltip,
    className = '',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        default: 'text-slate-400 hover:text-primary-600 hover:bg-primary-50',
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        danger: 'text-slate-400 hover:text-red-500 hover:bg-red-50',
    };

    const sizeClasses = {
        sm: 'w-7 h-7',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
    };

    const iconSizes = {
        sm: 16,
        md: 18,
        lg: 20,
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            title={tooltip}
            {...props}
        >
            <Icon size={iconSizes[size]} />
        </button>
    );
};
