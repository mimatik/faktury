import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { translations, Language } from '../utils/translations';
import { PdfCurrency } from './PdfCurrency';

// Register font for Czech characters support
Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Roboto',
        padding: 40,
        fontSize: 10,
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1e293b',
    },
    section: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    column: {
        flexDirection: 'column',
        width: '45%',
    },
    label: {
        fontSize: 8,
        color: '#64748b',
        marginBottom: 2,
    },
    value: {
        fontSize: 10,
        marginBottom: 4,
    },
    table: {
        marginTop: 20,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 5,
        marginBottom: 5,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingVertical: 5,
    },
    colDesc: { width: '40%' },
    colQty: { width: '10%', textAlign: 'right' },
    colPrice: { width: '15%', textAlign: 'right' },
    colVat: { width: '10%', textAlign: 'right' },
    colVatAmount: { width: '12%', textAlign: 'right' },
    colTotal: { width: '13%', textAlign: 'right' },

    totalSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    totalRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    totalLabel: {
        width: 100,
        textAlign: 'right',
        paddingRight: 10,
        color: '#64748b',
    },
    totalValue: {
        width: 100,
        textAlign: 'right',
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
    },
    qrCode: {
        width: 120,
        height: 120,
    },
});

interface InvoicePDFProps {
    invoice: any;
    user: any;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, user }) => {
    const langCode = (invoice.language || 'cs') as Language;
    const t = translations[langCode] || translations.cs;
    const locale = langCode === 'cs' ? 'cs-CZ' : 'en-GB';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>{t.title}</Text>
                        <Text style={styles.value}>{t.invoiceNumber}: {invoice.number}</Text>
                    </View>
                    <View>
                        {invoice.qrCodeDataUrl && (
                            <Image src={invoice.qrCodeDataUrl} style={styles.qrCode} />
                        )}
                    </View>
                </View>

                {/* Supplier & Customer */}
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={styles.label}>{t.supplier}</Text>
                        <Text style={{ ...styles.value, fontWeight: 'bold' }}>{user.companyName}</Text>
                        <Text style={styles.value}>{user.address}</Text>
                        <Text style={styles.value}>{t.ico}: {user.ico}</Text>
                        <Text style={styles.value}>{t.dic}: {user.dic}</Text>
                        <Text style={styles.value}>{t.account}: {user.bankAccount}</Text>
                    </View>
                    <View style={styles.column}>
                        <Text style={styles.label}>{t.customer}</Text>
                        <Text style={{ ...styles.value, fontWeight: 'bold' }}>{invoice.customer.name}</Text>
                        <Text style={styles.value}>{invoice.customer.address}</Text>
                        <Text style={styles.value}>{t.ico}: {invoice.customer.ico}</Text>
                        <Text style={styles.value}>{t.dic}: {invoice.customer.dic}</Text>
                    </View>
                </View>

                {/* Dates */}
                <View style={{ ...styles.row, marginTop: 20 }}>
                    <View style={styles.column}>
                        <Text style={styles.label}>{t.issueDate}</Text>
                        <Text style={styles.value}>{new Date(invoice.issueDate).toLocaleDateString(locale)}</Text>
                    </View>
                    <View style={styles.column}>
                        <Text style={styles.label}>{t.dueDate}</Text>
                        <Text style={styles.value}>{new Date(invoice.dueDate).toLocaleDateString(locale)}</Text>
                    </View>
                    <View style={styles.column}>
                        <Text style={styles.label}>{t.taxableDate}</Text>
                        <Text style={styles.value}>{new Date(invoice.taxableDate).toLocaleDateString(locale)}</Text>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colDesc}>{t.item}</Text>
                        <Text style={styles.colQty}>{t.quantity}</Text>
                        <Text style={styles.colPrice}>{t.pricePerUnit}</Text>
                        <Text style={styles.colVat}>{t.vatRate}</Text>
                        <Text style={styles.colVatAmount}>{t.vatAmount}</Text>
                        <Text style={styles.colTotal}>{t.total}</Text>
                    </View>
                    {invoice.items.map((item: any, index: number) => {
                        const baseAmount = item.quantity * item.unitPrice;
                        const vatAmount = baseAmount * (item.vatRate / 100);
                        const totalWithVat = baseAmount + vatAmount;
                        return (
                            <View key={index} style={styles.tableRow}>
                                <Text style={styles.colDesc}>{item.description}</Text>
                                <Text style={styles.colQty}>{item.quantity}</Text>
                                <PdfCurrency
                                    style={styles.colPrice}
                                    amount={item.unitPrice}
                                    currency={invoice.currency}
                                    language={langCode}
                                />
                                <Text style={styles.colVat}>{item.vatRate}%</Text>
                                <PdfCurrency
                                    style={styles.colVatAmount}
                                    amount={vatAmount}
                                    currency={invoice.currency}
                                    language={langCode}
                                />
                                <PdfCurrency
                                    style={styles.colTotal}
                                    amount={totalWithVat}
                                    currency={invoice.currency}
                                    language={langCode}
                                />
                            </View>
                        );
                    })}
                </View>

                {/* Totals */}
                <View style={styles.totalSection}>
                    <View>
                        {(() => {
                            // Calculate base and VAT totals
                            const baseTotal = invoice.items.reduce((sum: number, item: any) =>
                                sum + (item.quantity * item.unitPrice), 0);

                            // Group VAT by rate
                            const vatByRate: { [key: number]: number } = {};
                            invoice.items.forEach((item: any) => {
                                const baseAmount = item.quantity * item.unitPrice;
                                const vatAmount = baseAmount * (item.vatRate / 100);
                                if (!vatByRate[item.vatRate]) {
                                    vatByRate[item.vatRate] = 0;
                                }
                                vatByRate[item.vatRate] += vatAmount;
                            });



                            return (
                                <>
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>{t.base}:</Text>
                                        <PdfCurrency
                                            style={styles.totalValue}
                                            amount={baseTotal}
                                            currency={invoice.currency}
                                            language={langCode}
                                        />
                                    </View>
                                    {Object.entries(vatByRate).map(([rate, amount]) => (
                                        <View key={rate} style={styles.totalRow}>
                                            <Text style={styles.totalLabel}>{t.vatAmount} {rate}%:</Text>
                                            <PdfCurrency
                                                style={styles.totalValue}
                                                amount={amount as number}
                                                currency={invoice.currency}
                                                language={langCode}
                                            />
                                        </View>
                                    ))}
                                    <View style={{ ...styles.totalRow, marginTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 5 }}>
                                        <Text style={{ ...styles.totalLabel, fontWeight: 'bold' }}>{t.totalToPay}:</Text>
                                        <PdfCurrency
                                            style={{ ...styles.totalValue, fontSize: 14, fontWeight: 'bold' }}
                                            amount={invoice.total}
                                            currency={invoice.currency}
                                            language={langCode}
                                        />
                                    </View>
                                    {invoice.isVatReverseCharge && (
                                        <Text style={{ fontSize: 8, marginTop: 5 }}>{t.reverseCharge}</Text>
                                    )}
                                </>
                            );
                        })()}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>{t.footer}</Text>
                </View>
            </Page>
        </Document>
    );
};
