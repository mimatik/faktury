import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Button, Input } from './ui';

interface Customer {
    id: string;
    name: string;
    ico: string;
    dic?: string;
    address: string;
    defaultPrice: number;
    defaultCurrency: string;
    paymentTermsDays?: number;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    showContactOnInvoice: boolean;
}

interface CustomerFormData {
    name: string;
    ico: string;
    dic: string;
    address: string;
    defaultPrice: number;
    defaultCurrency: string;
    paymentTermsDays: number | '';
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    showContactOnInvoice: boolean;
}

interface CustomerFormProps {
    customer?: Customer;
    onSuccess: (customer: Customer) => void;
    onCancel: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<CustomerFormData>({
        name: '',
        ico: '',
        dic: '',
        address: '',
        defaultPrice: 1500,
        defaultCurrency: 'CZK',
        paymentTermsDays: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        showContactOnInvoice: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                ico: customer.ico,
                dic: customer.dic || '',
                address: customer.address,
                defaultPrice: customer.defaultPrice,
                defaultCurrency: customer.defaultCurrency,
                paymentTermsDays: customer.paymentTermsDays || '',
                contactName: customer.contactName || '',
                contactEmail: customer.contactEmail || '',
                contactPhone: customer.contactPhone || '',
                showContactOnInvoice: customer.showContactOnInvoice
            });
        } else {
            setFormData({
                name: '',
                ico: '',
                dic: '',
                address: '',
                defaultPrice: 1500,
                defaultCurrency: 'CZK',
                paymentTermsDays: '',
                contactName: '',
                contactEmail: '',
                contactPhone: '',
                showContactOnInvoice: false
            });
        }
    }, [customer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name || !formData.ico || !formData.address) {
            alert('Prosím vyplňte všechna povinná pole');
            return;
        }

        setIsSubmitting(true);

        try {
            let savedCustomer: Customer;

            // Prepare data - convert empty strings to null/undefined for optional fields
            const dataToSend = {
                ...formData,
                paymentTermsDays: formData.paymentTermsDays === '' ? null : formData.paymentTermsDays,
                contactName: formData.contactName || null,
                contactEmail: formData.contactEmail || null,
                contactPhone: formData.contactPhone || null,
            };

            if (customer?.id) {
                // Update existing customer
                savedCustomer = await api.put(`/customers/${customer.id}`, dataToSend);
            } else {
                // Create new customer
                savedCustomer = await api.post('/customers', dataToSend);
            }

            onSuccess(savedCustomer);
        } catch (error) {
            console.error(error);
            alert('Chyba při ukládání zákazníka');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Název firmy / Jméno"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                autoFocus
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="IČO"
                    type="text"
                    value={formData.ico}
                    onChange={(e) => setFormData({ ...formData, ico: e.target.value })}
                    required
                />
                <Input
                    label="DIČ (volitelné)"
                    type="text"
                    value={formData.dic}
                    onChange={(e) => setFormData({ ...formData, dic: e.target.value })}
                />
            </div>

            <Input
                label="Adresa"
                as="textarea"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
            />

            <div className="grid grid-cols-3 gap-4">
                <Input
                    label="Výchozí cena"
                    type="number"
                    value={formData.defaultPrice}
                    onChange={(e) => setFormData({ ...formData, defaultPrice: parseFloat(e.target.value) || 0 })}
                    required
                    min="0"
                    step="0.01"
                />
                <div>
                    <label className="label">Výchozí měna</label>
                    <select
                        className="input"
                        value={formData.defaultCurrency}
                        onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                    >
                        <option value="CZK">CZK (Kč)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                    </select>
                </div>
                <Input
                    label="Splatnost (dny)"
                    type="number"
                    value={formData.paymentTermsDays}
                    onChange={(e) => setFormData({ ...formData, paymentTermsDays: e.target.value === '' ? '' : parseInt(e.target.value) })}
                    min="0"
                    placeholder="např. 14"
                />
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Kontaktní informace (volitelné)</h3>

                <Input
                    label="Kontaktní osoba"
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Jméno kontaktní osoby"
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Kontaktní email"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="email@example.com"
                    />
                    <Input
                        label="Kontaktní telefon"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="+420 123 456 789"
                    />
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 mt-3">
                    <input
                        type="checkbox"
                        id="showContact"
                        className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                        checked={formData.showContactOnInvoice}
                        onChange={(e) => setFormData({ ...formData, showContactOnInvoice: e.target.checked })}
                    />
                    <label htmlFor="showContact" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                        Zobrazit kontakt na faktuře
                    </label>
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                    Zrušit
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Ukládám...' : (customer?.id ? 'Uložit změny' : 'Uložit')}
                </Button>
            </div>
        </form>
    );
};
