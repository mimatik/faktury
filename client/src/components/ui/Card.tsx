import React, { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
    variant?: 'default' | 'bordered' | 'elevated';
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
        default: 'bg-white rounded-xl shadow-card border border-slate-100 p-6',
        bordered: 'bg-white rounded-xl border-2 border-slate-200 p-6',
        elevated: 'bg-white rounded-xl shadow-lg p-6',
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
