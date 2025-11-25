export const formatCurrency = (amount: number, currency: string, language: string = 'cs'): string => {
    const locale = language === 'cs' ? 'cs-CZ' : 'en-GB';

    if (language === 'cs' && currency === 'CZK') {
        return amount.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK' });
    }

    return amount.toLocaleString(locale, {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'code'
    }).replace(currency, '').trim() + ' ' + currency;
};
