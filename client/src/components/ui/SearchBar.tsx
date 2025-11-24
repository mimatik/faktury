import React, { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    containerClassName?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    containerClassName = '',
    className = '',
    placeholder = 'Hledat...',
    ...props
}) => {
    return (
        <div className={`relative ${containerClassName}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
                type="text"
                className={`w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors ${className}`}
                placeholder={placeholder}
                {...props}
            />
        </div>
    );
};
