import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, API_URL } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { Plus, Trash2, Save, ArrowLeft, Calendar, User, FileText, CreditCard, Settings, Download } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Modal, Button } from '../components/ui';
import { CustomerForm } from '../components/CustomerForm';
import { IconButton } from '../components/ui/IconButton';

interface Customer {
    id: string;
    name: string;
    ico: string;
    dic?: string;
    address: string;
}

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
}

export const InvoiceEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(!!id);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        number: '', // Will be auto-generated
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        taxableDate: new Date().toISOString().split('T')[0],
        customerId: '',
        currency: 'CZK',
        language: 'cs',
        isVatReverseCharge: false,
        items: [{ description: '', quantity: 1, unitPrice: 0, vatRate: 21 }] as InvoiceItem[]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const customersData = await api.get('/customers');
                setCustomers(customersData);

                // If editing, load invoice data
                if (id) {
                    const invoice = await api.get(`/invoices/${id}`);
                    setFormData({
                        number: invoice.number,
                        issueDate: new Date(invoice.issueDate).toISOString().split('T')[0],
                        dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
                        taxableDate: new Date(invoice.taxableDate).toISOString().split('T')[0],
                        customerId: invoice.customerId,
                        currency: invoice.currency || 'CZK',
                        language: invoice.language || 'cs',
                        isVatReverseCharge: invoice.isVatReverseCharge || false,
                        items: invoice.items || [{ description: '', quantity: 1, unitPrice: 0, vatRate: 21 }]
                    });
                    setIsLoading(false);
                } else {
                    // For new invoices, fetch next invoice number
                    const year = new Date().getFullYear();
                    const data = await api.get(`/invoices/next-number?year=${year}`);
                    setFormData(prev => ({ ...prev, number: data.number }));
                }
            } catch (error) {
                console.error(error);
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, vatRate: 21 }]
        });
    };

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleDelete = async (e: React.FormEvent) => {
        if (!id) return;

        if (window.confirm('Opravdu chcete smazat tuto fakturu? Tato akce je nevratná.')) {
            try {
                await api.delete(`/invoices/${id}`);
                navigate('/invoices');
            } catch (error) {
                console.error(error);
                alert('Chyba při mazání faktury');
            }
        } else {
            e.preventDefault();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (id) {
                // Update existing invoice
                await api.put(`/invoices/${id}`, formData);
            } else {
                // Create new invoice
                await api.post('/invoices', formData);
            }
            navigate('/invoices');
        } catch (error) {
            console.error(error);
            alert('Chyba při ukládání faktury');
        }
    };

    const handleSaveAndDownload = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let invoiceId = id;
            if (id) {
                // Update existing invoice
                await api.put(`/invoices/${id}`, formData);
            } else {
                // Create new invoice
                const newInvoice = await api.post('/invoices', formData);
                invoiceId = newInvoice.id;
            }
            // Open PDF in new window
            if (invoiceId) {
                const token = localStorage.getItem('token');
                window.open(`${API_URL}/invoices/${invoiceId}/pdf?token=${token}`, '_blank', 'noopener,noreferrer');
            }
            // navigate('/invoices');
        } catch (error) {
            console.error(error);
            alert('Chyba při ukládání faktury');
        }
    };

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === '__new__') {
            // Reset the dropdown to empty before opening modal
            setFormData({ ...formData, customerId: '' });
            setIsCustomerModalOpen(true);
        } else {
            setFormData({ ...formData, customerId: value });
        }
    };

    const fetchCustomers = async () => {
        try {
            const data = await api.get('/customers');
            setCustomers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCustomerSuccess = async (newCustomer: Customer) => {
        setIsCustomerModalOpen(false);
        // Refresh customers first, then select the new one
        await fetchCustomers();
        setFormData({ ...formData, customerId: newCustomer.id });
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Načítání...</div>;
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8 pb-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <IconButton
                            icon={ArrowLeft}
                            onClick={() => navigate(-1)}
                            variant="ghost"
                            size="lg"
                            tooltip="Zpět"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{id ? 'Upravit fakturu' : 'Nová faktura'}</h1>
                            <p className="text-slate-500 mt-1">{id ? 'Upravit existující daňový doklad' : 'Vytvořit nový daňový doklad'}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {/* <Button type="button" icon={ArrowLeft} onClick={() => navigate(-1)} variant="ghost">
                            Zrušit
                        </Button> */}
                        <Button type="submit" icon={Save}>
                            Uložit fakturu
                        </Button>
                        <Button onClick={handleSaveAndDownload} icon={Download}>
                            Uložit a stáhnout
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* General Info */}
                        <Card className="space-y-6">
                            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                                <FileText className="text-primary-600" size={20} />
                                <h2 className="text-lg font-bold text-slate-900">Základní údaje</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="label">Číslo faktury</label>
                                    <input
                                        type="text"
                                        className="input font-mono"
                                        value={formData.number}
                                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Odběratel</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <select
                                            className="input pl-10"
                                            value={formData.customerId}
                                            onChange={handleCustomerChange}
                                            required
                                        >
                                            <option value="">Vyberte odběratele...</option>
                                            <option value="__new__" className="font-semibold text-primary-600">+ Přidat odběratele...</option>
                                            <option disabled>──────────</option>
                                            {customers.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="label">Datum vystavení</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="date"
                                            className="input pl-10"
                                            value={formData.issueDate}
                                            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Datum zdan. plnění</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="date"
                                            className="input pl-10"
                                            value={formData.taxableDate}
                                            onChange={(e) => setFormData({ ...formData, taxableDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Datum splatnosti</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="date"
                                            className="input pl-10"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Items */}
                        <Card className="space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="text-primary-600" size={20} />
                                    <h2 className="text-lg font-bold text-slate-900">Položky faktury</h2>
                                </div>
                                <button type="button" onClick={addItem} className="btn btn-secondary text-sm py-1.5 px-3 gap-2">
                                    <Plus size={16} />
                                    Přidat položku
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.items.map((item, index) => {
                                    const baseAmount = item.quantity * item.unitPrice;
                                    const vatAmount = baseAmount * (item.vatRate / 100);
                                    const totalAmount = baseAmount + vatAmount;

                                    return (
                                        <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-100 group hover:border-primary-200 transition-colors space-y-3">
                                            <div className="grid grid-cols-12 gap-4 items-start">
                                                <div className="col-span-5">
                                                    <label className="label text-xs">Popis</label>
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        placeholder="Název položky"
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="label text-xs">Množství</label>
                                                    <input
                                                        type="number"
                                                        className="input"
                                                        placeholder="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                        required
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="label text-xs">Cena/mj</label>
                                                    <input
                                                        type="number"
                                                        className="input"
                                                        placeholder="0"
                                                        value={item.unitPrice}
                                                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        required
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="label text-xs">DPH %</label>
                                                    <select
                                                        className="input"
                                                        value={item.vatRate}
                                                        onChange={(e) => handleItemChange(index, 'vatRate', parseFloat(e.target.value))}
                                                    >
                                                        <option value="0">0%</option>
                                                        <option value="10">10%</option>
                                                        <option value="15">15%</option>
                                                        <option value="21">21%</option>
                                                    </select>
                                                </div>
                                                <div className="col-span-1 flex items-end justify-end pt-5">
                                                    <IconButton
                                                        icon={Trash2}
                                                        onClick={() => removeItem(index)}
                                                        variant="danger"
                                                        disabled={formData.items.length === 1}
                                                        tooltip="Odebrat položku"
                                                    />
                                                </div>
                                            </div>

                                            {/* Item total calculation */}
                                            <div className="flex justify-end items-center gap-4 pt-2 border-t border-slate-200">
                                                <div className="text-right">
                                                    <div className="text-xs/5 text-slate-500">
                                                        Základ: {formatCurrency(baseAmount, formData.currency, formData.language)}
                                                    </div>
                                                    <div className="text-xs/5 text-slate-500">
                                                        DPH ({item.vatRate}%): {formatCurrency(vatAmount, formData.currency, formData.language)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs/5 text-slate-500">Celkem:</div>
                                                    <div className="text-sm/5 font-bold text-slate-900">
                                                        {formatCurrency(totalAmount, formData.currency, formData.language)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* VAT Summary */}
                            <div className="pt-6 border-t-2 border-slate-200 space-y-3">
                                {(() => {
                                    const baseTotal = formData.items.reduce((sum, item) => {
                                        return sum + (item.quantity * item.unitPrice);
                                    }, 0);

                                    const vatByRate: { [key: number]: number } = {};
                                    formData.items.forEach((item) => {
                                        const baseAmount = item.quantity * item.unitPrice;
                                        const vatAmount = baseAmount * (item.vatRate / 100);
                                        if (!vatByRate[item.vatRate]) {
                                            vatByRate[item.vatRate] = 0;
                                        }
                                        vatByRate[item.vatRate] += vatAmount;
                                    });

                                    const totalVat = Object.values(vatByRate).reduce((sum, vat) => sum + vat, 0);
                                    const grandTotal = baseTotal + totalVat;

                                    return (
                                        <div className="max-w-md ml-auto">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-600">Základ (bez DPH):</span>
                                                <span className="font-semibold text-slate-900">
                                                    {formatCurrency(baseTotal, formData.currency, formData.language)}
                                                </span>
                                            </div>

                                            {Object.entries(vatByRate).map(([rate, amount]) => (
                                                <div key={rate} className="flex justify-between items-center">
                                                    <span className="text-sm text-slate-600">DPH {rate}%:</span>
                                                    <span className="font-semibold text-slate-700">
                                                        {formatCurrency(amount, formData.currency, formData.language)}
                                                    </span>
                                                </div>
                                            ))}

                                            <div className="flex justify-between items-center py-3 bg-primary-50 -mx-4 px-4 rounded-lg mt-3">
                                                <span className="text-base font-bold text-slate-900">Celkem k úhradě:</span>
                                                <span className="text-2xl font-bold text-primary-600">
                                                    {formatCurrency(grandTotal, formData.currency, formData.language)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Settings */}
                    <div className="space-y-4">
                        <Card className="space-y-6">
                            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                                <Settings className="text-primary-600" size={20} />
                                <h2 className="text-lg font-bold text-slate-900">Nastavení</h2>
                            </div>

                            <div>
                                <label className="label">Měna</label>
                                <select
                                    className="input"
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                >
                                    <option value="CZK">CZK (Kč)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="USD">USD ($)</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">Jazyk faktury</label>
                                <select
                                    className="input"
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                >
                                    <option value="cs">Čeština</option>
                                    <option value="en">Angličtina</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <input
                                    type="checkbox"
                                    id="vatReverse"
                                    className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                                    checked={formData.isVatReverseCharge}
                                    onChange={(e) => setFormData({ ...formData, isVatReverseCharge: e.target.checked })}
                                />
                                <label htmlFor="vatReverse" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                    Přenesená daňová povinnost
                                </label>
                            </div>
                        </Card>
                        <div className="flex justify-end mt-2">
                            {id && (
                                <Button
                                    type="button"
                                    onClick={handleDelete}
                                    variant="danger"
                                    icon={Trash2}
                                >
                                    Smazat
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            {/* Customer Modal - Outside form to avoid nested forms */}
            <Modal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                title="Nový odběratel"
            >
                <CustomerForm
                    onSuccess={handleCustomerSuccess}
                    onCancel={() => setIsCustomerModalOpen(false)}
                />
            </Modal>
        </>
    );
};
