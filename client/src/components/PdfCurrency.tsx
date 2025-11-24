import React from 'react';
import { Text } from '@react-pdf/renderer';
import { formatCurrency } from '../utils/formatters';

interface PdfCurrencyProps {
    amount: number;
    currency: string;
    language?: string;
    style?: any;
}

export const PdfCurrency: React.FC<PdfCurrencyProps> = ({ amount, currency, language = 'cs', style }) => {
    const formattedValue = formatCurrency(amount, currency, language);

    return (
        <Text style={style}>{formattedValue}</Text>
    );
};
