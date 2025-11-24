import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface BaseInputProps {
    label?: string;
    error?: string;
    icon?: LucideIcon;
    containerClassName?: string;
}

type InputProps = BaseInputProps & InputHTMLAttributes<HTMLInputElement> & {
    as?: 'input';
};

type TextareaProps = BaseInputProps & TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: 'textarea';
};

export type CombinedInputProps = InputProps | TextareaProps;

export const Input: React.FC<CombinedInputProps> = ({
    label,
    error,
    icon: Icon,
    containerClassName = '',
    className = '',
    as = 'input',
    ...props
}) => {
    const baseClasses = 'w-full px-3 py-2 bg-white border rounded-lg text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 transition-colors';
    const iconPadding = Icon ? 'pl-10' : '';
    const errorClasses = error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500';

    const inputElement = as === 'textarea' ? (
        <textarea
            className={`${baseClasses} ${iconPadding} ${errorClasses} ${className} min-h-[80px]`}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
    ) : (
        <input
            className={`${baseClasses} ${iconPadding} ${errorClasses} ${className}`}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
    );

    return (
        <div className={containerClassName}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon size={18} />
                    </div>
                )}
                {inputElement}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};
