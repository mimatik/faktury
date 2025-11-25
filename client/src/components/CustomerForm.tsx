import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Button, Input } from './ui';

interface Customer {
    id: string;
    name: string;
    ico: string;
    dic?: string;
    address: string;
}

interface CustomerFormData {
    name: string;
    ico: string;
    dic: string;
    address: string;
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
        address: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                ico: customer.ico,
                dic: customer.dic || '',
                address: customer.address
            });
        } else {
            setFormData({ name: '', ico: '', dic: '', address: '' });
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

            if (customer?.id) {
                // Update existing customer
                savedCustomer = await api.put(`/customers/${customer.id}`, formData);
            } else {
                // Create new customer
                savedCustomer = await api.post('/customers', formData);
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
