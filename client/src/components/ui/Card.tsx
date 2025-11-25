import React, { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
    variant?: 'default' | 'elevated' | 'table';
    children: ReactNode;
}

export const Card: React.FC<CardProps> = ({
    title,
    subtitle,
    actions,
    variant = 'default',
    children,
    className = '',
    ...props
}) => {
    const variantClasses = {
        default: 'card shadow-card border-0 p-6',
        elevated: 'card shadow-lg p-6',
        table: 'card p-0 overflow-hidden border-1 shadow-soft',
    };

    return (
        <div className={`${variantClasses[variant]} ${className}`} {...props}>
            {(title || subtitle || actions) && (
                <div className="flex items-start justify-between mb-4">
                    <div>
                        {title && (
                            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            )}
            {children}
        </div>
    );
};
